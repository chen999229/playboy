const { Op } = require('sequelize')
const { DestroyRecord, ArchiveRecord, User } = require('../models/index')
const { success, error } = require('../utils/response')
const { downloadExcel } = require('../utils/excel')

class DestroyController {
  async apply(req, res) {
    try {
      const { archive_id, reason } = req.body
      
      const archive = await ArchiveRecord.findByPk(archive_id)
      if (!archive) {
        return res.json(error('档案不存在'))
      }
      if (archive.status === 0) {
        return res.json(error('该档案已被销毁'))
      }
      
      await DestroyRecord.create({
        archive_id,
        archive_no: archive.archive_no,
        archive_title: archive.title,
        user_id: req.user.id,
        reason,
        status: 0
      })
      
      res.json(success(null, '销毁申请提交成功，等待审批'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async approve(req, res) {
    try {
      const { id, status, comment } = req.body
      
      const destroy = await DestroyRecord.findByPk(id)
      if (!destroy) {
        return res.json(error('销毁记录不存在'))
      }
      
      if (status === 1) {
        await ArchiveRecord.update({ status: 0 }, { where: { id: destroy.archive_id } })
        await DestroyRecord.update({
          status: 1,
          approve_user_id: req.user.id,
          approve_date: new Date(),
          approve_comment: comment,
          destroy_date: new Date()
        }, { where: { id } })
        res.json(success(null, '销毁审批通过，档案已标记为销毁'))
      } else {
        await DestroyRecord.update({
          status: 2,
          approve_user_id: req.user.id,
          approve_date: new Date(),
          approve_comment: comment
        }, { where: { id } })
        res.json(success(null, '销毁申请已驳回'))
      }
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const { page = 1, size = 10, status, archive_no, user_id } = req.query
      const where = {}
      
      if (status !== undefined) where.status = status
      if (archive_no) where.archive_no = { [Op.like]: `%${archive_no}%` }
      if (user_id) where.user_id = user_id
      
      const { count, rows } = await DestroyRecord.findAndCountAll({
        where,
        include: [
          { model: User, as: 'User', attributes: ['real_name'] },
          { model: User, as: 'ApproveUser', attributes: ['real_name'] }
        ],
        limit: parseInt(size),
        offset: (parseInt(page) - 1) * parseInt(size),
        order: [['created_at', 'DESC']]
      })
      
      res.json(success({ list: rows, total: count }))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async export(req, res) {
    try {
      const { status, archive_no, user_id } = req.query
      const where = {}
      
      if (status !== undefined) where.status = status
      if (archive_no) where.archive_no = { [Op.like]: `%${archive_no}%` }
      if (user_id) where.user_id = user_id
      
      const records = await DestroyRecord.findAll({
        where,
        include: [
          { model: User, as: 'User', attributes: ['real_name'] },
          { model: User, as: 'ApproveUser', attributes: ['real_name'] }
        ],
        order: [['created_at', 'DESC']]
      })
      
      const data = records.map(record => ({
        '档案编号': record.archive_no,
        '档案标题': record.archive_title,
        '申请人': record.User?.real_name || '',
        '申请日期': record.created_at ? record.created_at.toLocaleDateString() : '',
        '销毁原因': record.reason || '',
        '状态': ['待审批', '已销毁', '已驳回'][record.status] || '',
        '审批人': record.ApproveUser?.real_name || '',
        '审批日期': record.approve_date ? record.approve_date.toLocaleDateString() : '',
        '审批意见': record.approve_comment || '',
        '销毁日期': record.destroy_date ? record.destroy_date.toLocaleDateString() : ''
      }))
      
      const headers = ['档案编号', '档案标题', '申请人', '申请日期', '销毁原因', '状态', '审批人', '审批日期', '审批意见', '销毁日期']
      downloadExcel(res, data, headers, '销毁台账')
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new DestroyController()
