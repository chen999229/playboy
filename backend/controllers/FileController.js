const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { success, error } = require('../utils/response')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.xls', '.xlsx']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'), false)
    }
  }
})

class FileController {
  async upload(req, res) {
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.json(error(err.message))
      }
      const files = req.files?.map(file => ({
        filename: file.originalname,
        filepath: `/uploads/${file.filename}`,
        size: file.size,
        type: file.mimetype
      })) || []
      res.json(success(files, '文件上传成功'))
    })
  }

  async download(req, res) {
    try {
      const { filename } = req.params
      const filePath = path.join(uploadDir, filename)
      
      if (!fs.existsSync(filePath)) {
        return res.json(error('文件不存在'))
      }
      
      const ext = path.extname(filename).toLowerCase()
      const contentType = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }[ext] || 'application/octet-stream'
      
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment;filename=${encodeURIComponent(filename)}`)
      
      const stream = fs.createReadStream(filePath)
      stream.pipe(res)
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async preview(req, res) {
    try {
      const { filename } = req.params
      const filePath = path.join(uploadDir, filename)
      
      if (!fs.existsSync(filePath)) {
        return res.json(error('文件不存在'))
      }
      
      const ext = path.extname(filename).toLowerCase()
      const contentType = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      }[ext]
      
      if (!contentType) {
        return res.json(error('不支持预览的文件类型'))
      }
      
      res.setHeader('Content-Type', contentType)
      const stream = fs.createReadStream(filePath)
      stream.pipe(res)
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async delete(req, res) {
    try {
      const { filename } = req.params
      const filePath = path.join(uploadDir, filename)
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      
      res.json(success(null, '文件删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }

  async batchDelete(req, res) {
    try {
      const { filenames } = req.body
      for (const filename of filenames) {
        const filePath = path.join(uploadDir, filename)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
      res.json(success(null, '批量删除成功'))
    } catch (err) {
      res.json(error(err.message))
    }
  }
}

module.exports = new FileController()
