const express = require('express')
const router = express.Router()
const FileController = require('../controllers/FileController')
const { auth } = require('../middleware/auth')

router.post('/upload', auth, FileController.upload)
router.get('/download/:filename', auth, FileController.download)
router.get('/preview/:filename', auth, FileController.preview)
router.delete('/:filename', auth, FileController.delete)
router.post('/batch-delete', auth, FileController.batchDelete)

module.exports = router
