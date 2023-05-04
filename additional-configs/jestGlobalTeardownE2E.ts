import { promisify } from 'node:util';

import puppeteerPreset from 'jest-puppeteer';
import treeKill from 'tree-kill';

import { PKG_DIR, stdoutLog } from '../e2e/helpers';

module.exports = async (globalConfig: unknown) => {
  if (process.cwd() !== PKG_DIR) {
    stdoutLog('Changed dir back to package dir');
    process.chdir(PKG_DIR);
  }

  const { servePid, verdaccioPid } = globalThis.e2eGlobal ?? {};

  if (typeof servePid === 'number') {
    await promisify(treeKill)(servePid);
    stdoutLog(`Killed 'serve' by pid '${servePid}'`);
  }

  if (typeof verdaccioPid === 'number') {
    await promisify(treeKill)(verdaccioPid);
    stdoutLog(`Killed 'verdaccio' by pid '${verdaccioPid}'`);
  }

  await require(puppeteerPreset.globalTeardown)(globalConfig);
};
