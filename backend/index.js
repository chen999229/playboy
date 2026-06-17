const express = require('express')
const cors = require('cors')
const path = require('path')
require('./utils/env').loadEnv()
const sequelize = require('./config/db')
const logger = require('./middleware/logger')

// 初始化模型关联关系
require('./models/index')

const app = express()
const PORT = process.env.PORT || 3000

// 全局异常处理 - 未捕获的Promise异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// 全局异常处理 - 未捕获的同步异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json;charset=utf-8')
  next()
})

app.use(logger)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/user', require('./routes/user'))
app.use('/api/role', require('./routes/role'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/archive/category', require('./routes/archive-category'))
app.use('/api/archive/record', require('./routes/archive-record'))
app.use('/api/borrow', require('./routes/borrow'))
app.use('/api/destroy', require('./routes/destroy'))
app.use('/api/file', require('./routes/file'))
app.use('/api/statistics', require('./routes/statistics'))

app.get('/api/test', (req, res) => {
  res.send({ code: 200, msg: '后端连通成功，中文测试', data: null })
})

app.use(express.static(path.join(__dirname, '../frontend/dist')))

app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ code: 404, msg: '接口不存在', data: null })
  }
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: null })
})

sequelize.authenticate()
  .then(() => console.log('✅ 数据库连接成功，编码utf8mb4'))
  .catch(err => console.error('❌数据库连接失败：', err))

app.listen(PORT, () => {
  console.log(`🚀后端服务运行在 http://localhost:${PORT}`)
})
