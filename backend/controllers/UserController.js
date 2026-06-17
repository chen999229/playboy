const { Op } = require('sequelize')
const { User, Role } = require('../models/index')
const { success, error } = require('../utils/response')
const { SECRET_KEY, EXPIRES_IN } = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const hashPassword = (password) => {
  return crypto.createHash('md5').update(password + SECRET_KEY).digest('hex')
}

class UserController {
  async login(req, res) {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ where: { username, status: 1 } })
      
      if (!user) {
        return res.json(error('用户名不存在'))
      }
      
      if (hashPassword(password) !== user.password) {
        return res.json(error('密码错误'))
      }
      
      const token = jwt.sign({ id: user.id, username: user.username, role_id: user.role_id }, SECRET_KEY, { expiresIn: EXPIRES_IN })
      
      res.json(success({
        token,
        user: {
          id: user.id,
          username: user.username,
          real_name: user.real_name,
          role_id: user.role_id
        }
      }, '登录成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async getInfo(req, res) {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
        include: [{ model: Role, as: 'Role', attributes: ['name'] }]
      })
      res.json(success({
        id: user.id,
        username: user.username,
        real_name: user.real_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: user.Role?.name || ''
      }))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body
      const user = await User.findOne({ where: { id: req.user.id } })
      
      if (hashPassword(oldPassword) !== user.password) {
        return res.json(error('原密码错误'))
      }
      
      await User.update({ password: hashPassword(newPassword) }, { where: { id: req.user.id } })
      
      res.json(success(null, '密码修改成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async list(req, res) {
    try {
      const { page = 1, size = 10, username, real_name, role_id, status } = req.query
      const where = {}
      
      if (username) where.username = { [Op.like]: `%${username}%` }
      if (real_name) where.real_name = { [Op.like]: `%${real_name}%` }
      if (role_id) where.role_id = role_id
      if (status !== undefined) where.status = status
      
      const { count, rows } = await User.findAndCountAll({
        where,
        include: [{ model: Role, as: 'Role', attributes: ['name'] }],
        limit: parseInt(size),
        offset: (parseInt(page) - 1) * parseInt(size),
        order: [['created_at', 'DESC']]
      })
      
      res.json(success({ list: rows, total: count }))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async updateStatus(req, res) {
    try {
      const { id, status } = req.body
      await User.update({ status }, { where: { id } })
      res.json(success(null, status === 1 ? '账号已启用' : '账号已禁用'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async create(req, res) {
    try {
      const { username, password, real_name, email, phone, role_id } = req.body
      
      const user = await User.create({
        username,
        password: hashPassword(password),
        real_name,
        email,
        phone,
        role_id: role_id || 2,
        status: 1
      })
      
      res.json(success(user, '用户创建成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async update(req, res) {
    try {
      const { id, real_name, email, phone, role_id } = req.body
      await User.update({ real_name, email, phone, role_id }, { where: { id } })
      res.json(success(null, '用户信息更新成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params
      await User.destroy({ where: { id } })
      res.json(success(null, '用户删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new UserController()
