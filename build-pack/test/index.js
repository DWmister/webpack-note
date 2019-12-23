// 单元测试的入口文件

const path = require('path');

process.chdir(path.join(__dirname, 'smoke/template'));

// eslint-disable-next-line no-undef
describe('build-pack test case', () => {
  // eslint-disable-next-line global-require
  require('./unit/webpack-base-test');
});

/**
 * 使用mocha+assert编写单元测试用例
 * nyc 查看测试覆盖率 https://istanbul.js.org/
 */
