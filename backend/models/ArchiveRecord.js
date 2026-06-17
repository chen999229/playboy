const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ArchiveRecord = sequelize.define('ArchiveRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  archive_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100)
  },
  organization: {
    type: DataTypes.STRING(200)
  },
  publish_date: {
    type: DataTypes.DATE
  },
  page_count: {
    type: DataTypes.INTEGER
  },
  file_path: {
    type: DataTypes.TEXT
  },
  keywords: {
    type: DataTypes.TEXT
  },
  summary: {
    type: DataTypes.TEXT
  },
  storage_location: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  borrowed: {
    type: DataTypes.TINYINT,
    defaultValue: 0
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
  tableName: 'archive_records',
  paranoid: true
})

module.exports = ArchiveRecord
