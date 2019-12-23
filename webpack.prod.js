const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWepackPlugin = require('optimize-css-assets-webpack-plugin')
const glob = require('glob')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const PurgecssPlugin = require('purgecss-webpack-plugin')

const smp = new SpeedMeasurePlugin()
const PATHS = {
    src: path.join(__dirname, 'src')
}

/**
 * 多页面打包，动态设置entry和HtmlWebpackPlugin
 * 利用glob.sync 动态获取entry和设置html-webpack-plugin的数量
 */
const setMPA = () => {
    const entry = {}
    const htmlWebpackPlugins = []
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))
    Object.keys(entryFiles)
        .map(index => {
            const entryFile = entryFiles[index]
            const match = entryFile.match(/\/src\/(.*)\/index.js/)
            const pageName = match && match[1]
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
        })
    return {
        entry,
        htmlWebpackPlugins
    }
}
const { entry, htmlWebpackPlugins } = setMPA()

// 多入口
module.exports = smp.wrap({
    // entry: {
    //   index: './src/index/index.js',
    //   search: './src/search/index.js'
    // },
    entry: entry,
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'js/[name]_[chunkhash:8].js'
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
                    // {
                    //   loader: 'thread-loader',
                    //   options: {
                    //     // 采用3个进程
                    //     workers: 3
                    //   }
                    // },
                    'babel-loader'
                    // 'eslint-loader'
                ],
                // 只解析src目录下的js模块,对于node_modules文件不处理
                include: path.resolve('src')
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
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'img/[name]_[hash:8].[ext]'
                        }
                    },
                    // 图片压缩
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65
                            },
                            // optipng.enabled: false will disable optipng
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65, 0.90],
                                speed: 4
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            // the webp option will enable WEBP
                            webp: {
                                quality: 75
                            }
                        }
                    }
                ]
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
        ...htmlWebpackPlugins,
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
        // new HtmlWebpackExternalsPlugin({
        //   externals: [
        //     {
        //       module: 'react',
        //       entry: 'https://unpkg.com/react@16/umd/react.development.js',
        //       global: 'React',
        //     },{
        //       module: 'react-dom',
        //       entry: 'https://unpkg.com/react-dom@1clear6/umd/react-dom.development.js',
        //       global: 'ReactDOM',
        //     }
        //   ]
        // }),
        // 优化命令行的构建日志
        new FriendlyErrorsWebpackPlugin(),
        // 捕获构建异常
        // function () {
        //   this.hooks.done.tap('done', stats => {
        //     if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
        //       console.log('build error')
        //       process.exit(1);
        //     }
        //   })
        // }
        // 打包体积分析
        // new BundleAnalyzerPlugin(),
        // 分包
        // new webpack.DllReferencePlugin({
        //     manifest: require('./build/library/library.json')
        // }),
        // new AddAssetHtmlPlugin([{
        //     filepath: require.resolve(path.join(__dirname, './build/library/library_0ddd83ba7007eae9bd7e.dll.js')),
        // }]),
        new HardSourceWebpackPlugin(),
        // 擦除无用css
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
        })
    ],
    // 使用splitChunksPlugin分离基础包
    optimization: {
        splitChunks: {
            // 尺寸大小
            minSize: 0,
            // maxSize: 0,
            cacheGroups: {
                commons: {
                    // 分离基础库
                    // test: /(react|react-dom)/,
                    // name: 'vendors',
                    // chunks: 'all'
                    // 分离静态资源
                    name: 'common',
                    chunks: 'all',
                    // 引用次数
                    minChunks: 2
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,
                cache: true
            })
        ]
    },
    // 统计信息
    // stats: 'errors-only',
    // 模块查找策略
    resolve: {
        alias: {
            'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js')
        },
        extensions: ['.js'],
        mainFields: ['main']
    }
})

/**
 * 文件指纹
 * 打包后输出的文件名的后缀
 * 用处：
 * 1、版本的管理
 * 2、对于没有修改的文件，可以持续使用浏览器本地的缓存，加速页面访问
 * hash方式：
 * 1、hash，和整个项目的构建相关，只要文件有修改，整个项目的hash值都会更改
 * 2、chunkhash，一般对于js文件使用；和webpack打包的chunk相关
 * 3、contenthash，一般对于css文件使用；根据文件内容定义hash，文件内容不变，能contenthash不变
 *
 * js压缩(默认会压缩)
 * webpack4已经内置了 uglifyjs-webpack-plugin
 * css压缩
 * optimize-css-assets-webpack-plugin
 * html压缩生成
 * html-webpack-plugin
 *
 * css的增强
 * 1、构建时自动添加前缀
 * autoprefixer postcss-loader
 * 2、移动端px自动转rem(font-size of the root element)
 * px2rem-loader 以构建的手段将px转为rem
 * lib-flexible库 动态计算不同设备下的rem相对于px的单位
 * 注意：
 * 在css文件中添加/*no*\/可以不进行rem的转换
 * 3、使用purgecss-webpack-plugin擦除无用的css(要配合mini-css-extract-plugin使用)
 *
 * 静态资源内联
 * 代码层面：
 * 1、页面框架的初始化脚本
 * 2、可以避免页面闪动
 * 请求层面：
 * 1、减少http网络请求数，小图片或者字体内联(url-loader)
 * raw-loader@0.5.1
 * 作用：
 * 读取一个文件，将文件内容插入到指定位置
 *
 * 页面公共资源提取 https://webpack.js.org/plugins/split-chunks-plugin/
 * split-chunks-plugin(webpack4内置)
 * 用于代码分割
 * html-webpack-externals-plugin
 * 用于基础库的分离,比如将vue/react的基础包通过cdn引入，不打入bundle文件
 *
 * tree shaking  webpack4 production默认开启
 * 1个模块可能有很多方法，只要其中的某个方法使用到了，则整个存储方法的文件都会被打入bundle，
 * tree shaking就是只把用到的方法打入bundle。
 * 要求：必须是ES6语法
 * 原理：
 * 1、利用ES6模块的特点： import/export
 * 2、代码擦除：uglify阶段删除无用代码
 *
 * scope hoisting 模块优化  webpack4 production默认开启(moduleConcatentionPlugin)
 * 减少函数声明代码和内存开销
 * 要求：必须是ES6语法
 * 
 * add-asset-html-webpack-plugin
 * 自动在 html 文件中引入动态链接库脚本
 *
 * 代码分割：
 * 场景：
 *  抽离相同代码到一个共享块
 *  脚本懒加载，使得初始下载的代码更小
 * 懒加载js脚本方式
 *  commonjs: require.ensure
 *  es6: 动态import(需要babel转换)
 *
 * 优化命令行的构建日志
 * friendly-errors-webpack-plugin
 * webpack默认的stats,也可设置显示统计信息  https://webpack.js.org/configuration/stats/#root
 *
 * 构建异常和中断处理
 * build失败的话，通过echo $?可查看错误码
 * 如果build成功，则echo $?返回值为0
 */


/**
 * build优化
 *
 * 速度分析 分析每个loader和插件耗时
 * speed-measure-webpack-plugin
 *
 * 体积分析
 * webpack-bundle-analyzer
 *
 * 速度优化：
 * 多进程/多实例构建
 * thread-loader
 * https://github.com/webpack-contrib/thread-loader
 *
 * 多进程/多实例并行压缩
 * terser-webpack-plugin
 *
 * 分包(vue/react已弃用，效益并不大,推荐HardSourceWebpackPlugin)
 * dllplugin
 * (事先把常用但又构建时间长的代码提前打包好)
 * 将基础包和业务包打包成一个文件
 * webpack.dll.js
 * 
 * 缓存
 * 提升二次构建速度
 * 1、babel-loader 开启缓存
 * 2、terser-webpack-plugin开启缓存
 * 3、使用cache-loader或者hard-source-webpack-plugin
 * 设置缓存后，会在node_modules里面添加.cache文件
 * 
 * 缩小构建目标
 * 尽可能减少构建模块
 * 比如babel-loader不解析node_modules
 * 优化resolve.modules配置(模块解析过程，减少模块搜索层级)
 * 优化resolve.mainFields配置
 * 优化resolve.extensions配置（模块路径查找）
 * 合理使用alias(比如查找react，直接在node_modules里面的指定路径找)
 * 
 * 体积优化：
 * 图片压缩 https://github.com/tcoopman/image-webpack-loader
 * image-webpack-loader
 * 
 * 动态polyfill (https://polyfill.io/v3/polyfill.min.js)
 * polyfill-service 只给用户返回需要的polyfill(script标签引入使用)
 * 原理：
 * 识别User Agent,下发不同的polyfill
 * babel-polyfill的缺点：
 * 包含所有的补丁，不管是否用得到
 */



/**
 * SplitChunks和Dllplugin的区别
 * 推荐使用 SplitChunks 去提取页面间的公共 js 文件
 * 因为使用 SplitChunks 每次去提取基础包还是需要耗费构建时间的，
 * DllPlugin 只需要预编译一次，后面的基础包时间都可以省略掉。
 */
