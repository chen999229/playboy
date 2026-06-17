const { Op } = require('sequelize')
const { BorrowRecord, ArchiveRecord, User } = require('../models/index')
const { success, error } = require('../utils/response')
const { downloadExcel } = require('../utils/excel')

class BorrowController {
  async apply(req, res) {
    try {
      const { archive_id, borrow_date, expected_return_date, reason } = req.body
      
      const archive = await ArchiveRecord.findByPk(archive_id)
      if (!archive) {
        return res.json(error('档案不存在'))
      }
      if (archive.borrowed === 1) {
        return res.json(error('该档案已被借阅'))
      }
      
      await BorrowRecord.create({
        archive_id,
        user_id: req.user.id,
        borrow_date,
        expected_return_date,
        reason,
        status: 0
      })
      
      res.json(success(null, '借阅申请提交成功，等待审批'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async approve(req, res) {
    try {
      const { id, status, comment } = req.body
      
      await BorrowRecord.update({
        status,
        approve_user_id: req.user.id,
        approve_date: new Date(),
        approve_comment: comment
      }, { where: { id } })
      
      const borrow = await BorrowRecord.findByPk(id)
      if (status === 1) {
        await ArchiveRecord.update({ borrowed: 1 }, { where: { id: borrow.archive_id } })
        res.json(success(null, '审批通过'))
      } else {
        res.json(success(null, '审批驳回'))
      }
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async return(req, res) {
    try {
      const { id } = req.body
      const borrow = await BorrowRecord.findByPk(id)
      
      if (!borrow || borrow.status !== 1) {
        return res.json(error('借阅记录不存在或状态不正确'))
      }
      
      await BorrowRecord.update({
        status: 2,
        actual_return_date: new Date()
      }, { where: { id } })
      
      await ArchiveRecord.update({ borrowed: 0 }, { where: { id: borrow.archive_id } })
      
      res.json(success(null, '归还成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const { page = 1, size = 10, status, user_id, archive_no } = req.query
      const where = {}
      
      if (status !== undefined) where.status = status
      if (user_id) where.user_id = user_id
      
      const { count, rows } = await BorrowRecord.findAndCountAll({
        where,
        include: [
          { model: ArchiveRecord, attributes: ['archive_no', 'title'] },
          { model: User, as: 'User', attributes: ['real_name'] },
          { model: User, as: 'ApproveUser', attributes: ['real_name'] }
        ],
        limit: parseInt(size),
        offset: (parseInt(page) - 1) * parseInt(size),
        order: [['created_at', 'DESC']]
      })
      
      const now = new Date()
      const result = rows.map(row => ({
        ...row.toJSON(),
        overdue: row.expected_return_date < now && row.status === 1
      }))
      
      res.json(success({ list: result, total: count }))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async export(req, res) {
    try {
      const { status, user_id } = req.query
      const where = {}
      
      if (status !== undefined) where.status = status
      if (user_id) where.user_id = user_id
      
      const records = await BorrowRecord.findAll({
        where,
        include: [
          { model: ArchiveRecord, attributes: ['archive_no', 'title'] },
          { model: User, as: 'User', attributes: ['real_name'] },
          { model: User, as: 'ApproveUser', attributes: ['real_name'] }
        ],
        order: [['created_at', 'DESC']]
      })
      
      const now = new Date()
      const data = records.map(record => ({
        '档案编号': record.ArchiveRecord?.archive_no || '',
        '档案标题': record.ArchiveRecord?.title || '',
        '借阅人': record.User?.real_name || '',
        '借阅日期': record.borrow_date ? record.borrow_date.toLocaleDateString() : '',
        '预计归还': record.expected_return_date ? record.expected_return_date.toLocaleDateString() : '',
        '实际归还': record.actual_return_date ? record.actual_return_date.toLocaleDateString() : '',
        '状态': ['待审批', '已借阅', '已归还', '已驳回'][record.status] || '',
        '是否逾期': record.expected_return_date < now && record.status === 1 ? '是' : '否',
        '审批人': record.ApproveUser?.real_name || '',
        '审批意见': record.approve_comment || ''
      }))
      
      const headers = ['档案编号', '档案标题', '借阅人', '借阅日期', '预计归还', '实际归还', '状态', '是否逾期', '审批人', '审批意见']
      downloadExcel(res, data, headers, '借阅台账')
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new BorrowController()
