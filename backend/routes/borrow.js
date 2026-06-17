const express = require('express')
const router = express.Router()
const BorrowController = require('../controllers/BorrowController')
const { auth } = require('../middleware/auth')

router.post('/apply', auth, BorrowController.apply)
router.post('/approve', auth, BorrowController.approve)
router.post('/return', auth, BorrowController.return)
router.get('/list', auth, BorrowController.list)
router.get('/export', auth, BorrowController.export)

module.exports = router
