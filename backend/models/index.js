const User = require('./User')
const Role = require('./Role')
const Menu = require('./Menu')
const ArchiveCategory = require('./ArchiveCategory')
const ArchiveRecord = require('./ArchiveRecord')
const BorrowRecord = require('./BorrowRecord')
const DestroyRecord = require('./DestroyRecord')

// 定义模型关联关系
// User 属于 Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'Role' })
// Role 拥有多个 User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' })

// Menu 自关联（树形结构）
Menu.hasMany(Menu, { foreignKey: 'parent_id', as: 'children' })
Menu.belongsTo(Menu, { foreignKey: 'parent_id', as: 'parent' })

// ArchiveCategory 自关联（树形结构）
ArchiveCategory.hasMany(ArchiveCategory, { foreignKey: 'parent_id', as: 'children' })
ArchiveCategory.belongsTo(ArchiveCategory, { foreignKey: 'parent_id', as: 'parent' })

// ArchiveRecord 属于 ArchiveCategory
ArchiveRecord.belongsTo(ArchiveCategory, { foreignKey: 'category_id', as: 'Category' })
ArchiveCategory.hasMany(ArchiveRecord, { foreignKey: 'category_id', as: 'records' })

// ArchiveRecord 属于 User (创建者)
ArchiveRecord.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

// BorrowRecord 属于 ArchiveRecord
BorrowRecord.belongsTo(ArchiveRecord, { foreignKey: 'archive_id', as: 'archive' })
BorrowRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

// DestroyRecord 属于 ArchiveRecord
DestroyRecord.belongsTo(ArchiveRecord, { foreignKey: 'archive_id', as: 'archive' })
DestroyRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

module.exports = {
  User,
  Role,
  Menu,
  ArchiveCategory,
  ArchiveRecord,
  BorrowRecord,
  DestroyRecord
}
