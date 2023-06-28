/**
 * @type {import("jest").Config}
 **/
const jestConf = {
  preset: 'ts-jest/presets/js-with-ts',
  testRegex: 'src/index\\.test-.*',
};

module.exports = jestConf;
