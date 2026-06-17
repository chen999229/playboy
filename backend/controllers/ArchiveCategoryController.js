const { ArchiveCategory } = require('../models/index')
const { success, error } = require('../utils/response')

const buildTree = (categories, parentId) => {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat.toJSON(),
      children: buildTree(categories, cat.id)
    }))
}

class ArchiveCategoryController {
  async tree(req, res) {
    try {
      const categories = await ArchiveCategory.findAll({
        where: { status: 1 },
        order: [['sort', 'ASC'], ['id', 'ASC']]
      })
      
      const tree = buildTree(categories, 0)
      res.json(success(tree))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const categories = await ArchiveCategory.findAll({
        order: [['parent_id', 'ASC'], ['sort', 'ASC']]
      })
      res.json(success(categories))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async create(req, res) {
    try {
      const { name, parent_id, sort, description } = req.body
      const category = await ArchiveCategory.create({
        name,
        parent_id: parent_id || 0,
        sort: sort || 0,
        description
      })
      res.json(success(category, '分类创建成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async update(req, res) {
    try {
      const { id, name, parent_id, sort, description, status } = req.body
      await ArchiveCategory.update({
        name,
        parent_id: parent_id || 0,
        sort: sort || 0,
        description,
        status
      }, { where: { id } })
      res.json(success(null, '分类更新成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params
      const children = await ArchiveCategory.count({ where: { parent_id: id } })
      if (children > 0) {
        return res.json(error('请先删除子分类'))
      }
      await ArchiveCategory.destroy({ where: { id } })
      res.json(success(null, '分类删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async sort(req, res) {
    try {
      const { items } = req.body
      for (const item of items) {
        await ArchiveCategory.update({ sort: item.sort, parent_id: item.parent_id }, { where: { id: item.id } })
      }
      res.json(success(null, '排序成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new ArchiveCategoryController()
