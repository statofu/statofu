const path = require('node:path');

const puppeteerPreset = require('jest-puppeteer/jest-preset');
const tsPreset = require('ts-jest/presets/js-with-ts/jest-preset');

const isUnittest = process.env.TYPE === 'unittest';
const isE2E = process.env.TYPE === 'e2e';

const presetObj = isUnittest ? tsPreset : isE2E ? { ...tsPreset, ...puppeteerPreset } : {};

const testPath = isUnittest ? 'src' : isE2E ? 'e2e' : undefined;
const testRegex = ['__test__/.*\\.([cm]?js|ts)$', '(.*\\.)?(test|spec)\\.([cm]?js|ts)$'].map(
  (s) => {
    if (testPath) {
      s = `${testPath}/(.*/)*${s}`;
    }
    return s;
  }
);

const maxWorkers = isUnittest ? '75%' : isE2E ? 1 : undefined;

const setupFilesAfterEnv = isUnittest
  ? ['jest-extended/all']
  : isE2E
  ? ['jest-extended/all', 'expect-puppeteer']
  : [];

const globalSetup = isE2E ? '<rootDir>/additional-configs/jestGlobalSetupE2E.ts' : undefined;
const globalTeardown = isE2E ? '<rootDir>/additional-configs/jestGlobalTeardownE2E.ts' : undefined;

if (isE2E) {
  process.env.JEST_PUPPETEER_CONFIG = path.resolve('additional-configs/.jest-puppeteerrc.json');
}

/**
 * @type {import("jest").Config}
 **/
const jestConf = {
  ...presetObj,
  testRegex,
  maxWorkers,
  setupFilesAfterEnv,
  globalSetup,
  globalTeardown,
  modulePathIgnorePatterns: ['<rootDir>/verdaccio/storage'],
};

module.exports = jestConf;
