const db = require('../model/db');

function getPlaylist(req, res) {
  if (!req.query.course || !req.query.semester_code) {
    res.status(400).send('course or semester_code not specified in parameters');
    return;
  }
  db.Video.findAll({
    where: {
      course: req.query.course,
      semester_code: req.query.semester_code
    },
    order: [
      ['year', 'ASC'],
      ['month', 'ASC'],
      ['day', 'ASC'],
      ['hour', 'ASC'],
      ['minute', 'ASC']
    ]
  })
  .then(rows => {
    if(rows.length == 0) {
      return res.status(404).send('No videos found');
    } else {
      res.status(200).send(rows);
    }
  })
}

module.exports = { getPlaylist }