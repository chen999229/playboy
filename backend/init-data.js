const sequelize = require('./config/db')
const { SECRET_KEY } = require('./middleware/auth')
const crypto = require('crypto')

const hashPassword = (password) => {
  return crypto.createHash('md5').update(password + SECRET_KEY).digest('hex')
}

const initData = async () => {
  try {
    const Role = require('./models/Role')
    const Menu = require('./models/Menu')
    const User = require('./models/User')
    
    let adminRole = await Role.findOne({ where: { name: '管理员' } })
    if (!adminRole) {
      adminRole = await Role.create({ name: '管理员', description: '系统管理员' })
    }
    
    let userRole = await Role.findOne({ where: { name: '普通用户' } })
    if (!userRole) {
      userRole = await Role.create({ name: '普通用户', description: '普通用户' })
    }
    
    const menuData = [
      { id: 1, name: '统计看板', path: '/dashboard', icon: 'el-icon-layout', parent_id: 0, sort: 1, type: 1, status: 1 },
      { id: 2, name: '系统管理', path: '', icon: 'el-icon-setting', parent_id: 0, sort: 2, type: 1, status: 1 },
      { id: 3, name: '用户管理', path: '/system/user', icon: 'el-icon-user', parent_id: 2, sort: 1, type: 2, status: 1 },
      { id: 4, name: '角色管理', path: '/system/role', icon: 'el-icon-user-solid', parent_id: 2, sort: 2, type: 2, status: 1 },
      { id: 5, name: '菜单管理', path: '/system/menu', icon: 'el-icon-menu', parent_id: 2, sort: 3, type: 2, status: 1 },
      { id: 6, name: '档案管理', path: '', icon: 'el-icon-document', parent_id: 0, sort: 3, type: 1, status: 1 },
      { id: 7, name: '分类管理', path: '/archive/category', icon: 'el-icon-folder', parent_id: 6, sort: 1, type: 2, status: 1 },
      { id: 8, name: '档案著录', path: '/archive/record', icon: 'el-icon-edit', parent_id: 6, sort: 2, type: 2, status: 1 },
      { id: 9, name: '档案检索', path: '/archive/search', icon: 'el-icon-search', parent_id: 6, sort: 3, type: 2, status: 1 },
      { id: 10, name: '借阅管理', path: '', icon: 'el-icon-share', parent_id: 0, sort: 4, type: 1, status: 1 },
      { id: 11, name: '借阅申请', path: '/borrow/apply', icon: 'el-icon-circle-plus', parent_id: 10, sort: 1, type: 2, status: 1 },
      { id: 12, name: '借阅审批', path: '/borrow/approve', icon: 'el-icon-check', parent_id: 10, sort: 2, type: 2, status: 1 },
      { id: 13, name: '借阅记录', path: '/borrow/list', icon: 'el-icon-list', parent_id: 10, sort: 3, type: 2, status: 1 },
      { id: 14, name: '销毁管理', path: '', icon: 'el-icon-delete', parent_id: 0, sort: 5, type: 1, status: 1 },
      { id: 15, name: '销毁申请', path: '/destroy/apply', icon: 'el-icon-circle-plus', parent_id: 14, sort: 1, type: 2, status: 1 },
      { id: 16, name: '销毁审批', path: '/destroy/approve', icon: 'el-icon-check', parent_id: 14, sort: 2, type: 2, status: 1 },
      { id: 17, name: '销毁台账', path: '/destroy/list', icon: 'el-icon-list', parent_id: 14, sort: 3, type: 2, status: 1 }
    ]
    
    for (const menu of menuData) {
      const existing = await Menu.findByPk(menu.id)
      if (!existing) {
        await Menu.create(menu)
      }
    }
    
    const adminUser = await User.findOne({ where: { username: 'admin' } })
    if (!adminUser) {
      await User.create({
        username: 'admin',
        password: hashPassword('123456'),
        real_name: '系统管理员',
        role_id: adminRole.id,
        status: 1
      })
    }
    
    console.log('初始化数据完成')
    process.exit(0)
  } catch (err) {
    console.error('初始化数据失败:', err)
    process.exit(1)
  }
}

initData()
