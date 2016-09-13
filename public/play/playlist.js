var playlist = [];
var weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var semester = ['Summer School', '', 'Quarter 1', 'Semester 1', 'Quarter 2', 'Semester 2', 'Quarter 3', '', 'Quarter 4', ''];

function init() {
    //hide login dialog
    $('#login-modal').fadeOut(300);
    $.get('/api/v1/playlist' + window.location.search, function (data) {
        console.log(data);
        playlist = data;
        for (var i = 0; i < data.length; i++) {
            var v = data[i];
            v.date = new Date(v.year, v.month - 1, v.day, v.hour, v.minute);

            $('#playlist-list').append(
                '<div class="playlist-item" onclick="selectVideo(this)" data-id="' + v.video_id + '" data-url="' + toMediastoreUrl(v) + '">' +
                '   ' + weekday[v.date.getDay()] + ' ' + v.day + ' ' + month[v.month - 1] + '' +
                '</div>'
            );
            console.log(toMediastoreUrl(v));
        }

        var courses = parseCourseNames(data[0].course);
        var html = courses[0];
        for (var i = 1; i < courses.length; i++) {
            html += '<br>' + courses[i];
        }
        $('#course-name').html(html);
        $('#semester').text(semester[data[0].semester_code % 10] + ', ' + v.course_year);
        $('#total-videos').text(playlist.length);

        if (getUrlParameter('video_id')) {
            var videoFound = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].video_id == getUrlParameter('video_id')) {
                    selectVideo($('.playlist-item').eq(i));
                    videoFound = true;
                    break;
                }
            }
            if (!videoFound) {
                selectVideo($('.playlist-item').eq(0));
            }
        } else {
            selectVideo($('.playlist-item').eq(0));
        }
    });
}
function selectVideo(el) {
    $('.playlist-item').removeClass('selected');
    $(el).addClass('selected');
    var url = $(el).data('url');
    urlRoot = 'https://mediastore.auckland.ac.nz' + url;

    video.src = urlRoot;

    //Set the title of the video and page
    var info = parseUrl(urlRoot);
    var title = info.courseName + ' ' + info.courseNumber + ' ' + info.year + '-' + info.month + '-' + info.day;
    document.title = title + ' - Lecture Recordings Archive';
    document.querySelector('#title').innerText = title;
    document.querySelector('#video-title').innerText = title;

    //set the playlist progress number
    for (var i = 0; i < playlist.length; i++) {
        if (playlist[i].video_id == $(el).data('id')) {
            $('#current-video').text(i + 1);
            break;
        }
    }

    var newUrl = window.location.pathname
        + '?course=' + getUrlParameter('course')
        + '&semester_code=' + getUrlParameter('semester_code')
        + '&video_id=' + $(el).data('id');
    if (getUrlParameter('h')) {
        newUrl += '&h=' + getUrlParameter('h');
    }
    if (getUrlParameter('m')) {
        newUrl += '&m=' + getUrlParameter('m');
    }
    if (getUrlParameter('s')) {
        newUrl += '&s=' + getUrlParameter('s');
    }
    //set the url parameters
    if (getUrlParameter('video_id')) {
        window.history.pushState(null, '', newUrl);
    } else {
        window.history.replaceState(null, '', newUrl);
    }

    //Load default/saved values
    //Quality
    setQuality(localStorage.getItem('canvasVideoEnhancerQuality') || 'high');
    //Volume
    setVolume(localStorage.getItem('canvasVideoEnhancerVolume') || 1);
    lastInputVolume = setVolume(localStorage.getItem('canvasVideoEnhancerVolume') || 1);

    //Check if custom start time defined
    if (getUrlParameter('h') || getUrlParameter('m') || getUrlParameter('s')) {
        //Calculate start time
        var customStartTime = (getUrlParameter('h') * 3600)
            + (getUrlParameter('m') * 60)
            + (getUrlParameter('s') * 1);
        console.log(customStartTime);
        document.querySelector('#video').currentTime = customStartTime;
    } else {
        //Set time to start
        document.querySelector('#video').currentTime = startTime;
    }
    playVideo();

}
//send HEAD to mediastore to check current login status
//404 means logged in
//200 means NOT logged in
var loginCount = 0;
$.ajax({
    type: 'HEAD',
    dataType: 'jsonp',
    crossDomain: true,
    url: 'https://mediastore.auckland.ac.nz',
}).always(function (xhr) {
    console.log(xhr.status);
    if (xhr.status == 200) {
        //attempt autologin
        $('#login-frame').attr('src', 'https://mediastore.auckland.ac.nz/.preview');
        $('#login-frame').one('load', function () {
            //check login status (send another xhr)
            $.ajax({
                type: 'HEAD',
                dataType: 'jsonp',
                crossDomain: true,
                url: 'https://mediastore.auckland.ac.nz',
            }).always(function (xhr) {
                console.log(xhr.status);
                if (xhr.status == 200) {
                    //autologin failed, show modal to prompt for user/pass
                    $('#login-modal').fadeIn(300);
                    $('#login-frame').on('load', function () {
                        //check again for login status
                        $.ajax({
                            type: 'HEAD',
                            dataType: 'jsonp',
                            crossDomain: true,
                            url: 'https://mediastore.auckland.ac.nz',
                        }).always(function (xhr) {
                            console.log(xhr.status);
                            if (xhr.status == 200) {
                                console.log('login failed!');
                                loginCount++;
                                if (loginCount > 1) {
                                    //todo troubleshooting hint
                                }
                            } else {
                                init();
                            }
                        });
                    });
                } else {
                    init();
                }
            })
        });
    } else {
        init();
    }

});

function toMediastoreUrl(v) {
    var url = '/' +
        v.course_year + '/' +
        v.semester_code + '/' +
        v.course + '/' +
        v.infix + '/' +
        v.prefix + v.year + v.month.padLeft(2) + v.day.padLeft(2) + v.hour.padLeft(2) + v.minute.padLeft(2) + '.' +
        v.suffix;
    return url;
}

Number.prototype.padLeft = function (n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
};

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
    return null;
};

function parseCourseNames(str) {
    var courses = str.match(/[A-z]+?\d+?[A-z]?[A-z]\d+?[A-z]/g);
    for (var i = 0; i < courses.length; i++) {
        var c = courses[i];
        var subject = c.match(/[A-z]+?(?=\d)/)[0];
        var stream = c.match(/[A-z]\d+?[A-z]$/)[0];
        var courseCode = c.replace(subject, '').replace(stream, '');
        courses[i] = subject + ' ' + courseCode + ' ' + stream;
    }
    return courses;
}