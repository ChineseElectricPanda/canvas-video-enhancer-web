/* Requires */
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cors = require('cors');

/* Initialisation */
//Express.js and middleware
var app = express();
app.use(bodyParser.json());
app.use(cors());

//MySQL Connection Pool
var connectionPool = mysql.createPool({
    connectionLimit: 2,
    host: 'au-cdbr-azure-east-a.cloudapp.net',
    user: 'b9ee21e7c18903',
    password: '240f4fda',
    database: 'canvasvideoenhancer',
    debug: false
});


/*
 POST /video
 Record a video's URL
 */
app.post('/video', function (req, res) {
    console.log(req.body);
    var url = req.body.url;
    if (!url) {
        res.status(400).send('url not specified in POST body');
        return;
    }
    var i;
    try {
        i = parseUrl(url);
    } catch (e) {
        res.status(500).send('failed to parse url');
        return;
    }

    runQuery('INSERT INTO video (year,month,day,hour,minute,semester_code,infix,prefix,suffix,course,course_year)VALUES' +
        '(?,?,?,?,?,?,?,?,?,?,?)', [i.year, i.month, i.day, i.hour, i.minute, i.semester_code, i.infix, i.prefix, i.suffix, i.course, i.course_year],
        function () {
            res.status(201).send('Record created');
        }, function (err) {
            if (err.code == 'ER_DUP_ENTRY') {
                res.status(200).send('Record already exists');
            } else {
                res.status(500).send(err);
            }
        });
});

app.post('/api/v1/video', function (req, res) {
    console.log(req.body);
    var url = req.body.url;
    if (!url) {
        res.status(400).send('url not specified in POST body');
        return;
    }
    var i;
    try {
        i = parseUrl(url);
    } catch (e) {
        res.status(500).send('failed to parse url');
        return;
    }

    runQuery('INSERT INTO video (year,month,day,hour,minute,semester_code,infix,prefix,suffix,course,course_year)VALUES' +
        '(?,?,?,?,?,?,?,?,?,?,?)', [i.year, i.month, i.day, i.hour, i.minute, i.semester_code, i.infix, i.prefix, i.suffix, i.course, i.course_year],
        function () {
            res.status(201).send('Record created');
        }, function (err) {
            if (err.code == 'ER_DUP_ENTRY') {
                res.status(200).send('Record already exists');
            } else {
                res.status(500).send(err);
            }
        });
});

/*
 GET /courses
 Get a list of courses in the database
 */
app.get('/api/v1/courses', function (req, res) {
    runQuery('SELECT DISTINCT course,course_year,semester_code,count(*) as number_of_videos ' +
        'FROM video ' +
        'GROUP BY course, course_year, semester_code ' +
        'ORDER BY course ASC, semester_code DESC', [],
        function (rows) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(rows);
        }, function (err) {
            res.status(500).send(err);
        });

});

app.get('/api/v1/playlist', function (req, res) {
    if (!req.query.course || !req.query.semester_code) {
        res.status(400).send('course or semester_code not specified in parameters');
        return;
    }
    runQuery('SELECT * FROM video WHERE course=? AND semester_code=? ORDER BY year ASC, month ASC, day ASC, hour ASC, minute ASC',
        [req.query.course, req.query.semester_code],
        function (rows) {
            //404 if no videos returned
            if (rows.length == 0) {
                res.status(404).send('No videos found');
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(rows);
        }, function (err) {
            res.status(500).send(err);
        });
});

app.get('/api/v1/stats', function (req, res) {
    runQuery('SELECT COUNT(video_id) AS videos, COUNT(DISTINCT course) AS courses FROM video', [],
        function (rows) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(rows[0]);
        }, function (err) {
            res.status(500).send(err);
        });
});

app.get('/watch', function (req, res) {
    if (!(req.query.video_id || req.query.v)) {
        res.status(400).send('Must specify video_id')
    }
    runQuery('SELECT course,semester_code FROM video WHERE video_id=?',
        [req.query.video_id || req.query.v],
        function (rows) {
            //404 if video_id not found
            if (rows.length == 0) {
                res.status(404).send('Video not found');
            }
            //set redirect url
            var redirect = 'http://' + req.headers['host'] + '/play?course=' + rows[0].course + '&semester_code=' + rows[0].semester_code + '&video_id=' + req.query.video_id;
            //add timestamp if present
            if (typeof req.query.h == 'number') {
                redirect += '&h=' + req.query.h;
            }
            if (typeof req.query.m == 'number') {
                redirect += '&m=' + req.query.m;
            }
            if (typeof req.query.s == 'number') {
                redirect += '&s=' + req.query.s;
            }
            res.statusCode = 303;
            res.setHeader('Location', redirect);
            res.send();
        },
        function (err) {
            res.status(500).send(err);
        })
});

/* Static file routes TODO: Consider moving to another server */
app.use('/', express.static(__dirname + '/public'));

function parseUrl(url) {
    //url is in format <course_year>/<semester_code>/<infix>/<prefix><year><month><day><hour><minute>.<suffix>.preview
    //eg '2016/1163/SOFTENG364L01C/351618/201605101500.LT347936.preview'

    url = url.replace(/\.preview$/, '');
    var originalUrl = url;

    url = url.split('/');
    var info = {};
    info.course_year = url[0];
    info.semester_code = url[1];
    info.course = url[2];

    info.suffix = url[url.length - 1].match(/\..+$/)[0].substring(1);
    var dateTimeString = url[url.length - 1].match(/\d+/)[0];
    url[url.length - 1] = url[url.length - 1].replace(dateTimeString, '').replace('.' + info.suffix, '');
    info.prefix = url[url.length - 1];

    info.infix =
        originalUrl.replace(info.course_year + '/' + info.semester_code, '')
            .replace(info.semester_code, '')
            .replace(info.course, '')
            .replace(info.suffix, '')
            .replace(info.prefix, '')
            .replace(dateTimeString, '')
            //beginning /s
            .replace(/^(\/)+/, '')
            .replace(/\/(\.)+$/,'');


    info.year = dateTimeString.slice(0, 4);
    info.month = dateTimeString.slice(4, 6);
    info.day = dateTimeString.slice(6, 8);
    info.hour = dateTimeString.slice(8, 10);
    info.minute = dateTimeString.slice(10, 12);

    return info;
}

/**
 * Runs a query
 * @param {string} query the query to run
 * @param values[] query parameter values
 * @param {function(rows)} callback the callback to send the result to
 * @param {function(err)} errorCallback called if there is an error running the query
 */
function runQuery(query, values, callback, errorCallback) {
    connectionPool.getConnection(function (err, connection) {
        connection.release();
        if (err && errorCallback) {
            errorCallback(err);
        } else {
            connection.query(query, values, function (err, rows, fields) {
                if (err && errorCallback) {
                    errorCallback(err);
                } else {
                    if (callback) {
                        callback(rows);
                    }
                }
            });
        }
    });
}

app.listen(process.env.port || 3000);