module.exports = function(sequelize, DataTypes) {
  return sequelize.define('log', {
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    severity: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'log',
    schema: 'canvasvideoenhancer'
  })
}