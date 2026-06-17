const express = require('express')
const router = express.Router()
const MenuController = require('../controllers/MenuController')
const { auth } = require('../middleware/auth')

router.get('/tree', auth, MenuController.tree)
router.get('/list', auth, MenuController.list)
router.post('/create', auth, MenuController.create)
router.post('/update', auth, MenuController.update)
router.delete('/:id', auth, MenuController.delete)

module.exports = router
