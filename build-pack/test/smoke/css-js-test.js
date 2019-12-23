/* eslint-disable no-undef */
// mocha单元测试
// 测试是否生成了css/js文件

const glob = require('glob-all');

describe('Checking generated css/js files', () => {
  it('should generate css/js files', (done) => {
    const files = glob.sync([
      './dist/js/index_*.js',
      './dist/js/search_*.js',
      './dist/js/commons_*.js',
      './dist/index_*.css',
      './dist/search_*.css',
    ]);

    if (files.length > 0) {
      done();
    } else {
      throw new Error('no css/js files generated!');
    }
  });
});
