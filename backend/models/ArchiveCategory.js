const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const ArchiveCategory = sequelize.define('ArchiveCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.STRING(500)
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
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
  tableName: 'archive_categories',
  paranoid: true
})

module.exports = ArchiveCategory
