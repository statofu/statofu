/**
 * @type {import("jest").Config}
 **/
const jestConf = {
  testRegex: 'src/index\\.test-.*',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: __dirname + '/tsconfig.json',
      },
    ],
  },
};

module.exports = jestConf;
