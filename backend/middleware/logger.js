const fs = require('fs')
const path = require('path')

const logDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const logger = (req, res, next) => {
  const { method, url, body, query } = req
  const ip = req.ip || req.connection.remoteAddress
  const user = req.user?.username || '未登录用户'
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  
  const log = `[${timestamp}] [${ip}] [${user}] ${method} ${url} - body: ${JSON.stringify(body)} query: ${JSON.stringify(query)}\n`
  
  const logFile = path.join(logDir, `access_${new Date().toISOString().split('T')[0]}.log`)
  fs.appendFileSync(logFile, log, 'utf8')
  
  next()
}

module.exports = logger
