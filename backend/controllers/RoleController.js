const { Role, Menu } = require('../models/index')
const { success, error } = require('../utils/response')

class RoleController {
  async list(req, res) {
    try {
      const roles = await Role.findAll({ order: [['created_at', 'DESC']] })
      res.json(success(roles))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params
      const role = await Role.findByPk(id)
      res.json(success(role))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async create(req, res) {
    try {
      const { name, description, menus } = req.body
      const role = await Role.create({
        name,
        description,
        menus: menus ? JSON.stringify(menus) : null
      })
      res.json(success(role, '角色创建成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async update(req, res) {
    try {
      const { id, name, description, menus } = req.body
      await Role.update({
        name,
        description,
        menus: menus ? JSON.stringify(menus) : null
      }, { where: { id } })
      res.json(success(null, '角色更新成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params
      await Role.destroy({ where: { id } })
      res.json(success(null, '角色删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async assignMenus(req, res) {
    try {
      const { role_id, menus } = req.body
      await Role.update({ menus: JSON.stringify(menus) }, { where: { id: role_id } })
      res.json(success(null, '菜单权限分配成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async getRoleMenus(req, res) {
    try {
      const { role_id } = req.params
      const role = await Role.findByPk(role_id)
      const menus = role?.menus ? JSON.parse(role.menus) : []
      res.json(success(menus))
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new RoleController()
