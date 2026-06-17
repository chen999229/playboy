const fs = require('fs')
const path = require('path')

const loadEnv = () => {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=')
        if (equalIndex > -1) {
          const key = trimmedLine.substring(0, equalIndex).trim()
          const value = trimmedLine.substring(equalIndex + 1).trim()
          if (!(key in process.env)) {
            process.env[key] = value
          }
        }
      }
    })
  }
}

loadEnv()

module.exports = { loadEnv }
