/* eslint-disable no-undef */
const assert = require('assert').strict;
const baseConfig = require('../../lib/webpack.base');

describe('webpack.base.js test case', () => {
  it('entry is right', () => {
    assert.strictEqual(baseConfig.entry.index, '/Users/videt-zsl/Documents/zhangsl/pack/build-pack/test/smoke/template/src/index/index.js');
    assert.strictEqual(baseConfig.entry.search, '/Users/videt-zsl/Documents/zhangsl/pack/build-pack/test/smoke/template/src/search/index.js');
  });
  it('output is right', () => {
    assert.strictEqual(baseConfig.output.path, '/Users/videt-zsl/Documents/zhangsl/pack/build-pack/test/smoke/template/dist');
  });
});
