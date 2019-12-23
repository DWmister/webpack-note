// 服务端打包,window/document都不存在
if (typeof window === 'undefined') {
  global.window = {}
}

const express = require('express')
const { renderToString } = require('react-dom/server')
const SSR = require('../dist/js/search-server')
const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(path.join(__dirname, '../dist/search.html'), 'utf-8')
const mockData = require('./data.json')

const server = (port) => {
  // 实例化express
  const app = express()

  // 设置静态目录
  app.use(express.static('dist'))
  app.get('/search', (req, res) => {
    // renderToString(SSR) 渲染为字符串
    const html = renderHtml(renderToString(SSR))
    res.status(200).send(html)
  })
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
}

server(process.env.PORT || 3000)

// html模版
const renderHtml = (str) => {
  let dataStr = JSON.stringify(mockData)
  return template.replace('<!-- html-placeholder -->', str)
    .replace('<!-- mockData-placeholder -->', `<script>window.__mockData=${dataStr}</script>`)
}
