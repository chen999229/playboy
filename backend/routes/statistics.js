const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { ArchiveRecord, ArchiveCategory, BorrowRecord } = require('../models/index')
const { success, error } = require('../utils/response')
const { auth } = require('../middleware/auth')

router.get('/overview', auth, async (req, res) => {
  try {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    const totalArchives = await ArchiveRecord.count({ where: { status: 1 } })
    const borrowedArchives = await ArchiveRecord.count({ where: { status: 1, borrowed: 1 } })
    const totalCategories = await ArchiveCategory.count({ where: { status: 1 } })
    const pendingBorrows = await BorrowRecord.count({ where: { status: 0 } })
    
    res.json(success({
      totalArchives,
      borrowedArchives,
      availableArchives: totalArchives - borrowedArchives,
      totalCategories,
      pendingBorrows
    }))
  } catch (err) {
    res.json(error(err.message))
  }
})

router.get('/yearly-archive', auth, async (req, res) => {
  try {
    const { year } = req.query
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    
    const result = await ArchiveRecord.findAll({
      where: {
        status: 1,
        created_at: {
          [Op.between]: [`${targetYear}-01-01`, `${targetYear + 1}-01-01`]
        }
      },
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('created_at')), 'month'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['month'],
      order: ['month']
    })
    
    const data = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const item = result.find(r => r.dataValues.month === month)
      return { month, count: item ? item.dataValues.count : 0 }
    })
    
    res.json(success(data))
  } catch (err) {
    res.json(error(err.message))
  }
})

router.get('/category-stats', auth, async (req, res) => {
  try {
    const stats = await ArchiveRecord.findAll({
      where: { status: 1 },
      attributes: [
        'category_id',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['category_id'],
      include: [{ model: ArchiveCategory, attributes: ['name'] }]
    })
    
    const data = stats.map(s => ({
      category_id: s.category_id,
      category_name: s.ArchiveCategory?.name || '未知分类',
      count: parseInt(s.dataValues.count)
    }))
    
    res.json(success(data))
  } catch (err) {
    res.json(error(err.message))
  }
})

router.get('/borrow-trend', auth, async (req, res) => {
  try {
    const { year } = req.query
    const targetYear = year ? parseInt(year) : new Date().getFullYear()
    
    const result = await BorrowRecord.findAll({
      where: {
        status: { [Op.in]: [1, 2] },
        borrow_date: {
          [Op.between]: [`${targetYear}-01-01`, `${targetYear + 1}-01-01`]
        }
      },
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('borrow_date')), 'month'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['month'],
      order: ['month']
    })
    
    const data = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const item = result.find(r => r.dataValues.month === month)
      return { month, count: item ? item.dataValues.count : 0 }
    })
    
    res.json(success(data))
  } catch (err) {
    res.json(error(err.message))
  }
})

module.exports = router
