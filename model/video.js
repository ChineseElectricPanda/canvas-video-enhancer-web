module.exports = function (sequelize, DataTypes) {
  return sequelize.define('video', {
    video_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    year: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    month: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    day: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    hour: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    minute: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    course: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    course_year: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    semester_code: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      unique: 'uniqueVideo'
    },
    infix: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true,
      unique: 'uniqueVideo'
    },
    prefix: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true,
      unique: 'uniqueVideo'
    },
    suffix: {
      type: DataTypes.TEXT('tiny'),
      allowNull: true,
      unique: 'uniqueVideo'
    }
  }, {
    timestamps: false,
    tableName: 'video',
    schema: 'canvasvideoenhancer'
  })
}