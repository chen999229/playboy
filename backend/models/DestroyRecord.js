const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const DestroyRecord = sequelize.define('DestroyRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  archive_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  archive_no: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  archive_title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  approve_user_id: {
    type: DataTypes.INTEGER
  },
  approve_date: {
    type: DataTypes.DATE
  },
  approve_comment: {
    type: DataTypes.TEXT
  },
  destroy_date: {
    type: DataTypes.DATE
  },
  created_at: {
    type: DataTypes.DATE
  },
  updated_at: {
    type: DataTypes.DATE
  },
  deleted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'destroy_records',
  paranoid: true
})

module.exports = DestroyRecord
