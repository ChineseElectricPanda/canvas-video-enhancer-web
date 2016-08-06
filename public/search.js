var courseList = [];
$.get('/api/v1/courses', function (data) {
    courseList = data;
    for (var i = 0; i < data.length; i++) {
        var course = data[i];
        switch (course.semester_code % 10) {
            case 0:
                course.semester = 'SS';
                break;
            case 3:
                course.semester = 'S1';
                break;
            case 5:
                course.semester = 'S2';
                break;
            case 2:
                course.semester = 'Q1';
                break;
            case 4:
                course.semester = 'Q2';
                break;
            case 6:
                course.semester = 'Q3';
                break;
            case 8:
                course.semester = 'Q4';
                break;
            default:
                course.semester = '';
        }
        $('#search-results').append($(
            '<tr onclick="selectCourse(' + i + ')">' +
            '   <td>' + course.course + '</td>' +
            '   <td>' + course.number_of_videos + ' lecture' + (course.number_of_videos == 1 ? '' : 's') + '</td>' +
            '   <td>' + course.semester + ' ' + course.course_year + '</td>' +
            '</tr>'
        ));
    }
});

$.get('/api/v1/stats', function (data) {
    $('#video-count').text(data.videos);
    $('#course-count').text(data.courses);
    $('#subtitle').fadeIn(300);
})

function searchFilter(text) {
    $('body').addClass('searching');
    for (var i = 0; i < courseList.length; i++) {
        if (courseList[i].course.toLowerCase().indexOf(text.toLowerCase()) > -1) {
            $('#search-results>tr:nth-child(' + (i + 1) + ')').show().addClass('visible');
        } else {
            $('#search-results>tr:nth-child(' + (i + 1) + ')').hide().removeClass('visible');
        }
    }
}

function selectCourse(i) {
    window.location = '/play?course=' + courseList[i].course + '&semester_code=' + courseList[i].semester_code;
}

$(document).ready(function () {
    $('#search-bar').focus();
})