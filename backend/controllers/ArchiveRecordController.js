const { Op } = require('sequelize')
const { ArchiveRecord, ArchiveCategory } = require('../models/index')
const { success, error } = require('../utils/response')
const { downloadExcel } = require('../utils/excel')

class ArchiveRecordController {
  async create(req, res) {
    try {
      const { archive_no, title, category_id, author, organization, publish_date, page_count, file_path, keywords, summary, storage_location } = req.body
      
      const existing = await ArchiveRecord.findOne({ where: { archive_no } })
      if (existing) {
        return res.json(error('档案编号已存在'))
      }
      
      const record = await ArchiveRecord.create({
        archive_no,
        title,
        category_id,
        author,
        organization,
        publish_date,
        page_count,
        file_path: file_path || null,
        keywords,
        summary,
        storage_location,
        status: 1,
        borrowed: 0
      })
      
      res.json(success(record, '档案著录成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async update(req, res) {
    try {
      const { id, archive_no, title, category_id, author, organization, publish_date, page_count, file_path, keywords, summary, storage_location } = req.body
      await ArchiveRecord.update({
        archive_no,
        title,
        category_id,
        author,
        organization,
        publish_date,
        page_count,
        file_path: file_path || null,
        keywords,
        summary,
        storage_location
      }, { where: { id } })
      res.json(success(null, '档案更新成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params
      await ArchiveRecord.destroy({ where: { id } })
      res.json(success(null, '档案删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const { page = 1, size = 10, archive_no, title, category_id, author, status, borrowed } = req.query
      const where = {}
      
      if (archive_no) where.archive_no = { [Op.like]: `%${archive_no}%` }
      if (title) where.title = { [Op.like]: `%${title}%` }
      if (category_id) where.category_id = category_id
      if (author) where.author = { [Op.like]: `%${author}%` }
      if (status !== undefined) where.status = status
      if (borrowed !== undefined) where.borrowed = borrowed
      
      const { count, rows } = await ArchiveRecord.findAndCountAll({
        where,
        include: [{ model: ArchiveCategory, as: 'Category', attributes: ['name'] }],
        limit: parseInt(size),
        offset: (parseInt(page) - 1) * parseInt(size),
        order: [['created_at', 'DESC']]
      })
      
      res.json(success({ list: rows, total: count }))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params
      const record = await ArchiveRecord.findByPk(id, {
        include: [{ model: ArchiveCategory, as: 'Category', attributes: ['name'] }]
      })
      res.json(success(record))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async export(req, res) {
    try {
      const { archive_no, title, category_id, author, status, borrowed } = req.query
      const where = {}
      
      if (archive_no) where.archive_no = { [Op.like]: `%${archive_no}%` }
      if (title) where.title = { [Op.like]: `%${title}%` }
      if (category_id) where.category_id = category_id
      if (author) where.author = { [Op.like]: `%${author}%` }
      if (status !== undefined) where.status = status
      if (borrowed !== undefined) where.borrowed = borrowed
      
      const records = await ArchiveRecord.findAll({
        where,
        include: [{ model: ArchiveCategory, as: 'Category', attributes: ['name'] }],
        order: [['created_at', 'DESC']]
      })
      
      const data = records.map(record => ({
        '档案编号': record.archive_no,
        '档案标题': record.title,
        '分类名称': record.ArchiveCategory?.name || '',
        '作者': record.author || '',
        '机构': record.organization || '',
        '发布日期': record.publish_date ? record.publish_date.toLocaleDateString() : '',
        '页数': record.page_count || '',
        '关键词': record.keywords || '',
        '存放位置': record.storage_location || '',
        '状态': record.status === 1 ? '正常' : '已销毁',
        '借阅状态': record.borrowed === 1 ? '已借阅' : '在库',
        '创建时间': record.created_at ? record.created_at.toLocaleString() : ''
      }))
      
      const headers = ['档案编号', '档案标题', '分类名称', '作者', '机构', '发布日期', '页数', '关键词', '存放位置', '状态', '借阅状态', '创建时间']
      downloadExcel(res, data, headers, '档案台账')
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new ArchiveRecordController()
