const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

// 单入口
module.exports = {
  entry: './src/search/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[hash:8].js'
  },
  // 指定当前的构建环境
  mode: 'development',
  // loader 可将所有类型的文件转换为webpack能够处理的有效模块
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      { test: /\.js$/, use: 'babel-loader' },
      // 链式调用，从右往左
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
      { test: /\.(png|jpg|jpeg|gif)/, use: 'file-loader' },
      // {
      //   test: /\.(png|jpg|jpeg|gif)/,
      //   use: [{
      //     loader: 'url-loader',
      //     // 如果图片小于40k,自动base64
      //     options: { limit: 40 * 1024 }
      //   }]
      // },
      { test: /\.(woff|woff2|eot|ttf|otf)/, use: 'file-loader' }
    ]
  },
  // plugins 用于bundle文件的优化，作用于整个构建过程
  plugins: [
    // 创建html文件去承载输出的bundle
    new HtmlWebpackPlugin({
      // 指定模版生成html文件
      template: path.resolve(__dirname, './src/search/index.html')
    }),
    // webpack内置的插件
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsWebpackPlugin()
  ],
  devServer: {
    // 告诉服务器从哪个目录中提供内容, 只有在你想要提供静态文件时才需要
    contentBase: path.resolve(__dirname, 'dist'),
    // contentBase下的文件在修改之后(监听静态文件的变化)，会触发一次完整的页面重载。这个地方是指浏览器的刷新，而不是HMR
    watchContentBase: true,
    // 启用热更新功能
    hot: true,
    // 在 server 启动后打开浏览器
    open: false,
    // 监听请求的端口号
    port: 7072,
    // 统计信息
    stats: 'errors-only'
  },
  devtool: 'source-map'
}

/**
 * --watch 开启监听模式，当源码发生变化时，自动重新构建新的输出文件。但是重构之后需要手动刷新浏览器看到变化
 * 热更新原理： https://zhuanlan.zhihu.com/p/30669007
 *  webpack compile: 将js编译成bundle
 *  HMR: (HotModuleReplacementPlugin) 将HMR Runtime注入到bundle,使得bundle和HMR Server建立websocket通信 
 *  HMR Server: 服务端，将变化的js模块通过websocket的消息通知给浏览器端
 *  HMR Runtime: 浏览器端，接收HMR Server传递的模块数据
 * 
 * sourceMap
 * 简单说，就是一个信息文件，里面存储着位置信息  https://www.webpackjs.com/configuration/devtool/#devtool
 * 可选值有：source-map/eval/inline-source-map/cheap-source-map等
 */
