// ssr配置
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWepackPlugin = require('optimize-css-assets-webpack-plugin')
const glob = require('glob')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

/**
 * 多页面打包，动态设置entry和HtmlWebpackPlugin
 * 利用glob.sync 动态获取entry和设置html-webpack-plugin的数量
 */
const setMPA = () => {
  const entry = {}
  const htmlWebpackPlugins = []
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index-server.js'))
  Object.keys(entryFiles)
    .map(index => {
      const entryFile = entryFiles[index]
      const match = entryFile.match(/\/src\/(.*)\/index-server.js/)
      const pageName = match && match[1]
      if (pageName) {
        entry[pageName] = entryFile
        htmlWebpackPlugins.push(
          new HtmlWebpackPlugin({
            // 指定模版生成html文件
            template: path.join(__dirname, `./src/${pageName}/index.html`),
            // 指定生成的文件名称,默认为index.html
            filename: `${pageName}.html`,
            // 生成的html使用哪些chunk,{}默认全部加入,其值对应entry里面的键
            chunks: [pageName, 'common'],
            // chunks: ['vendors', pageName, 'common'],
            // 打包生成的js/css会自动注入到html,默认为true
            inject: true,
            // html压缩配置
            minify: {
              html5: true,
              collapseWhitespace: true,
              preserveLineBreaks: false,
              // 压缩一开始就内联在 html 里面的css和js,并不是打包生成的css/js文件
              minifyCSS: true,
              minifyJS: true,
              // 删除注释
              removeComments: false
            }
          })
        )
      }
    })
  return {
    entry,
    htmlWebpackPlugins
  }
}
const { entry, htmlWebpackPlugins } = setMPA()

// 多入口
module.exports = {
  entry: entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'js/[name]-server.js',
    libraryTarget: 'umd'
  },
  // 指定当前的构建环境
  mode: 'production',
  // loader 可将所有类型的文件转换为webpack能够处理的有效模块
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.js$/,
        use: [
          'babel-loader'
          // 'eslint-loader'
        ]
      },
      // 链式调用，从右往左
      {
        test: /\.(le|c|sa|sc)ss$/,
        // use: ['style-loader', 'css-loader', 'less-loader']
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // css的增强,其配置在package.json里面的postcss
          // 配置为：兼容到浏览器的最近两个版本, 使用人数占的比例
          'postcss-loader',
          // 注意less-loader和px2rem-loader的顺序
          {
            loader: 'px2rem-loader',
            options: {
              // rem相对于px的转算单位，1rem=75px，相对于750的设计稿
              remUnit: 75,
              // px转rem时，小数点位数
              remPrecision: 8
            }
          },
          'less-loader',
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'img/[name]_[hash:8].[ext]'
          }
        }]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'fonts/[name]_[hash:8].[ext]'
          }
        }]
      }
    ]
  },
  // plugins 用于bundle文件的优化，作用于整个构建过程
  plugins: [
    // 清空构建目录
    new CleanWebpackPlugin(),
    // 生成css文件
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    }),
    // 压缩css
    new OptimizeCssAssetsWepackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano')
    }),
    // 基础库分离 使用HtmlWebpackExternalsPlugin
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@16/umd/react.development.js',
          global: 'React',
        },{
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
          global: 'ReactDOM',
        }
      ]
    }),
    new FriendlyErrorsWebpackPlugin()
  ].concat(htmlWebpackPlugins),
  // 统计信息
  stats: 'errors-only'
}

