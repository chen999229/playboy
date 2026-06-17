const express = require('express')
const router = express.Router()
const ArchiveRecordController = require('../controllers/ArchiveRecordController')
const { auth } = require('../middleware/auth')

router.post('/create', auth, ArchiveRecordController.create)
router.post('/update', auth, ArchiveRecordController.update)
router.delete('/:id', auth, ArchiveRecordController.delete)
router.get('/list', auth, ArchiveRecordController.list)
router.get('/:id', auth, ArchiveRecordController.getById)
router.get('/export', auth, ArchiveRecordController.export)

module.exports = router
