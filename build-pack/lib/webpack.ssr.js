const merge = require('webpack-merge');
const OptimizeCssAssetsWepackPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const cssnano = require('cssnano');
const baseConfig = require('./webpack.base');

const prodConfig = {
  mode: 'production',
  module: {
    // 不解析css/js
    rules: [
      {
        test: /\.(le|c|sa|sc)ss$/,
        use: 'ignore-loader',
      },
    ],
  },
  plugins: [
    // 压缩css
    new OptimizeCssAssetsWepackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano,
    }),
    // 基础库分离 使用HtmlWebpackExternalsPlugin
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@16/umd/react.development.js',
          global: 'React',
        }, {
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@16/umd/react-dom.development.js',
          global: 'ReactDOM',
        },
      ],
    }),
  ],
  // 使用splitChunksPlugin分离基础包
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          // 分离静态资源
          name: 'commons',
          chunks: 'all',
          // 引用次数
          minChunks: 2,
        },
      },
    },
  },
};

module.exports = merge(baseConfig, prodConfig);
