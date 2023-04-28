const type = process.env.TYPE ?? 'unittest';

const testPath = type === 'unittest' ? '<rootDir>/src' : '<rootDir>/e2e';
const testPatterns = ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'];

const testMatch = testPatterns.map((testPattern) => `${testPath}/${testPattern}`);
const maxWorkers = type === 'unittest' ? '75%' : 1;

/**
 * @type {import('jest').Config}
 **/
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFilesAfterEnv: ['jest-extended/all'],
  testMatch,
  maxWorkers,
};
