const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(255)
  },
  icon: {
    type: DataTypes.STRING(100)
  },
  parent_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  type: {
    type: DataTypes.TINYINT,
    defaultValue: 1
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
  tableName: 'menus',
  paranoid: true
})

module.exports = Menu
