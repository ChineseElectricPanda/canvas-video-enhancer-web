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

function parseUrl(url) {
    //url is in format <course_year>/<semester_code>/<infix>/<prefix><year><month><day><hour><minute>.<suffix>.preview
    //eg '2016/1163/SOFTENG364L01C/351618/201605101500.LT347936.preview'
    url = url.replace(/\.preview$/, '');

    url = url.split('/');
    var info = {};
    info.course_year = url[0];
    info.semester_code = url[1];
    info.course = url[2];
    info.infix = url[3];

    info.suffix = url[4].split('.')[1];
    var dateTimeString = url[4].match(/\d+/)[0];
    url[4] = url[4].replace(dateTimeString, '').replace('.' + info.suffix, '');
    info.prefix = url[4];

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

console.log(parseUrl('2016/1163/SOFTENG364L01C/351618/201605101500.LT347936.preview'));
app.listen(process.env.port || 3000);