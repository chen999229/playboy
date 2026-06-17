const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const { auth } = require('../middleware/auth')

router.post('/login', UserController.login)
router.get('/info', auth, UserController.getInfo)
router.post('/change-password', auth, UserController.changePassword)
router.get('/list', auth, UserController.list)
router.post('/update-status', auth, UserController.updateStatus)
router.post('/create', auth, UserController.create)
router.post('/update', auth, UserController.update)
router.delete('/:id', auth, UserController.delete)

module.exports = router
