const db = require('../model/db');
const Sequelize = require('sequelize');

function addVideo(req, res) {
  const url = req.body.url
  if (!url) {
    res.status(400).send('url not specified in POST body');
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = parseUrl(url);
  } catch (e) {
    return res.status(500).send('failed to parse url');
  }

  db.Video.create({
    year: parsedUrl.year,
    month: parsedUrl.month,
    day: parsedUrl.day,
    hour: parsedUrl.hour,
    minute: parsedUrl.minute,
    semester_code: parsedUrl.semester_code,
    infix: parsedUrl.infix,
    prefix: parsedUrl.prefix,
    suffix: parsedUrl.suffix,
    course: parsedUrl.course,
    course_year: parsedUrl.course_year
  })
  .then(() => {
    return res.status(201).send('Record created');
  })
  .catch(Sequelize.UniqueConstraintError, err => {
    return res.status(200).send('Record already exists');
  })
  .catch(err => {
    return res.status(500).send(err);
  })
}

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
      .replace(info.prefix + dateTimeString + '.' + info.suffix, '')
      //leading /s
      .replace(/^(\/)+/, '')
      .replace(/\/(\.)*$/, '');

  info.year = dateTimeString.slice(0, 4);
  info.month = dateTimeString.slice(4, 6);
  info.day = dateTimeString.slice(6, 8);
  info.hour = dateTimeString.slice(8, 10);
  info.minute = dateTimeString.slice(10, 12);

  return info;
}

module.exports = { addVideo }