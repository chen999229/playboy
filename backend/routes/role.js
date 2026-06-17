const express = require('express')
const router = express.Router()
const RoleController = require('../controllers/RoleController')
const { auth } = require('../middleware/auth')

router.get('/list', auth, RoleController.list)
router.get('/:id', auth, RoleController.getById)
router.post('/create', auth, RoleController.create)
router.post('/update', auth, RoleController.update)
router.delete('/:id', auth, RoleController.delete)
router.post('/assign-menus', auth, RoleController.assignMenus)
router.get('/:role_id/menus', auth, RoleController.getRoleMenus)

module.exports = router
