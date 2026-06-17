const success = (data = null, msg = '操作成功') => {
  return { code: 200, msg, data }
}

const error = (msg = '操作失败', code = 500) => {
  return { code, msg, data: null }
}

module.exports = { success, error }
