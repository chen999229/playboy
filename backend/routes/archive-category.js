const express = require('express')
const router = express.Router()
const ArchiveCategoryController = require('../controllers/ArchiveCategoryController')
const { auth } = require('../middleware/auth')

router.get('/tree', auth, ArchiveCategoryController.tree)
router.get('/list', auth, ArchiveCategoryController.list)
router.post('/create', auth, ArchiveCategoryController.create)
router.post('/update', auth, ArchiveCategoryController.update)
router.delete('/:id', auth, ArchiveCategoryController.delete)
router.post('/sort', auth, ArchiveCategoryController.sort)

module.exports = router
