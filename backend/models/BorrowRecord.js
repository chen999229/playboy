const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const BorrowRecord = sequelize.define('BorrowRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  archive_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  borrow_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expected_return_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_return_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0
  },
  reason: {
    type: DataTypes.TEXT
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
  tableName: 'borrow_records',
  paranoid: true
})

module.exports = BorrowRecord
