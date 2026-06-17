require('../utils/env').loadEnv()
const jwt = require('jsonwebtoken')

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim()

  if (!token) {
    return res.status(401).json({ code: 401, msg: '未登录，请先登录', data: null })
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ code: 401, msg: 'token已过期，请重新登录', data: null })
  }
}

module.exports = { auth, SECRET_KEY, EXPIRES_IN }
