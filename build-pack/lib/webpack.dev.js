const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');

const devConfig = {
  mode: 'development',
  plugins: [
    // webpack内置的插件 热更新
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    // 告诉服务器从哪个目录中提供内容, 只有在你想要提供静态文件时才需要
    contentBase: path.resolve(__dirname, 'public'),
    // contentBase下的文件在修改之后(监听静态文件的变化)，会触发一次完整的页面重载。这个地方是指浏览器的刷新，而不是HMR
    watchContentBase: true,
    // 启用热更新功能
    hot: true,
    // 在 server 启动后打开浏览器
    open: false,
    // 监听请求的端口号
    port: 7072,
  },
};

module.exports = merge(baseConfig, devConfig);
