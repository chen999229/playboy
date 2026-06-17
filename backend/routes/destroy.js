const express = require('express')
const router = express.Router()
const DestroyController = require('../controllers/DestroyController')
const { auth } = require('../middleware/auth')

router.post('/apply', auth, DestroyController.apply)
router.post('/approve', auth, DestroyController.approve)
router.get('/list', auth, DestroyController.list)
router.get('/export', auth, DestroyController.export)

module.exports = router
