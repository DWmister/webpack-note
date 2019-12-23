const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

// 获取当前脚本的工作目录
const projectRoot = process.cwd();
const setMPA = () => {
  const entries = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'));
  Object.keys(entryFiles)
    .map((index) => {
      const entryFile = entryFiles[index];
      const match = entryFile.match(/\/src\/(.*)\/index.js/);
      const pageName = match && match[1];
      entries[pageName] = entryFile;
      return htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
          // 指定模版生成html文件
          template: path.join(projectRoot, `./src/${pageName}/index.html`),
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
            removeComments: false,
          },
        }),
      );
    });
  return {
    entries,
    htmlWebpackPlugins,
  };
};
const { entries, htmlWebpackPlugins } = setMPA();

module.exports = {
  entry: entries,
  output: {
    path: path.join(projectRoot, 'dist'),
    filename: 'js/[name]_[chunkhash:8].js',
  },
  module: {
    rules: [
      { test: /\.txt$/, use: 'raw-loader' },
      {
        test: /\.js$/,
        use: [
          'babel-loader',
          // 'eslint-loader'
        ],
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
              remPrecision: 8,
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'img/[name]_[hash:8].[ext]',
          },
        }],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'fonts/[name]_[hash:8].[ext]',
          },
        }],
      },
    ],
  },
  plugins: [
    // 清空构建目录
    new CleanWebpackPlugin(),
    // 生成css文件
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    // 优化命令行的构建日志
    new FriendlyErrorsWebpackPlugin(),
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only',
};
