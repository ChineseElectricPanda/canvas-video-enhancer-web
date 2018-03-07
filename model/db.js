const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'canvasvideoenhancer',
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    logging: false,
    host: process.env.DATABASE_HOSTNAME,
    dialect: 'mssql',
    dialectOptions: {
      encrypt: true
    }
  }
)

const Video = require('./video')(sequelize, Sequelize);
const Log = require('./log')(sequelize, Sequelize);

const syncedPromise = sequelize
  .authenticate()
  .then(() => {
    console.log('Syncing Database...');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database Synced');
  })

module.exports = {
  Video,
  Log,
  syncedPromise,
  sequelize
}

