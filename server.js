/* Requires */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/* Initialisation */
//Express.js and middleware
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(cors());

const db = require('./model/db');

const video = require('./routes/video');
const catalog = require('./routes/catalog');

router.route('/video')
  .post(video.addVideo);
router.route('/api/v1/video')
  .post(video.addVideo)

router.route('/api/v1/playlist')
  .get(catalog.getPlaylist);

app.use('/', router);

app.listen(process.env.port || 3000);