const fs = require('fs')
const path = require('path')

const generateExcel = (data, headers) => {
  let excelContent = '\uFEFF'
  excelContent += headers.join('\t') + '\n'
  
  data.forEach(row => {
    const rowData = headers.map(header => {
      const key = Object.keys(row).find(k => k.toLowerCase() === header.toLowerCase().replace(/\s+/g, '_'))
      const value = row[key] !== undefined ? row[key] : ''
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ')
    })
    excelContent += rowData.join('\t') + '\n'
  })
  
  return excelContent
}

const downloadExcel = (res, data, headers, filename) => {
  const excelContent = generateExcel(data, headers)
  res.setHeader('Content-Type', 'application/vnd.ms-excel;charset=utf-8')
  res.setHeader('Content-Disposition', `attachment;filename=${encodeURIComponent(filename)}.xlsx`)
  res.setHeader('Content-Length', Buffer.byteLength(excelContent, 'utf8'))
  res.write(excelContent, 'utf8')
  res.end()
}

module.exports = { generateExcel, downloadExcel }
