const { Menu } = require('../models/index')
const { success, error } = require('../utils/response')

const buildTree = (menus, parentId) => {
  return menus
    .filter(menu => menu.parent_id === parentId)
    .map(menu => ({
      ...menu.toJSON(),
      children: buildTree(menus, menu.id)
    }))
}

class MenuController {
  async tree(req, res) {
    try {
      const menus = await Menu.findAll({
        where: { status: 1 },
        order: [['sort', 'ASC'], ['id', 'ASC']]
      })
      
      const tree = buildTree(menus, 0)
      res.json(success(tree))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const menus = await Menu.findAll({ order: [['parent_id', 'ASC'], ['sort', 'ASC']] })
      res.json(success(menus))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async create(req, res) {
    try {
      const { name, path, icon, parent_id, sort, type, status } = req.body
      const menu = await Menu.create({
        name,
        path,
        icon,
        parent_id: parent_id || 0,
        sort: sort || 0,
        type: type || 1,
        status: status || 1
      })
      res.json(success(menu, '菜单创建成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async update(req, res) {
    try {
      const { id, name, path, icon, parent_id, sort, type, status } = req.body
      await Menu.update({
        name,
        path,
        icon,
        parent_id: parent_id || 0,
        sort: sort || 0,
        type: type || 1,
        status: status || 1
      }, { where: { id } })
      res.json(success(null, '菜单更新成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params
      const children = await Menu.count({ where: { parent_id: id } })
      if (children > 0) {
        return res.json(error('请先删除子菜单'))
      }
      await Menu.destroy({ where: { id } })
      res.json(success(null, '菜单删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new MenuController()
