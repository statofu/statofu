import crossSpawn from 'cross-spawn';
import puppeteerPreset from 'jest-puppeteer';
import killPort from 'kill-port';

import {
  PKG_DIR,
  PKG_NAME,
  PKG_TAG_E2E,
  SERVE_PORT,
  stdoutLog,
  throwErrIfNpmErr,
  VERDACCIO_E,
  VERDACCIO_ORIGIN,
  VERDACCIO_P,
  VERDACCIO_PORT,
  VERDACCIO_U,
  waitForTextInStream,
} from '../e2e/helpers';

export default async (globalConfig: unknown) => {
  if (process.cwd() !== PKG_DIR) {
    stdoutLog('Changed dir back to package dir');
    process.chdir(PKG_DIR);
  }

  globalThis.e2eGlobal = {};

  try {
    stdoutLog(`Trying to kill 'serve' by port '${SERVE_PORT}'...`);
    await killPort(SERVE_PORT);
    stdoutLog(`Killed 'serve' by port '${SERVE_PORT}'`);
  } catch {
    stdoutLog(`Didn't find 'serve' by port '${SERVE_PORT}'`);
  }
  stdoutLog(`Launching 'serve' on port '${SERVE_PORT}'...`);
  const serveProc = crossSpawn('npm', ['run', 'serve']);
  if (serveProc.stdout) {
    await waitForTextInStream(`:${SERVE_PORT}`, serveProc.stdout, 90000);
  }
  globalThis.e2eGlobal.servePid = serveProc.pid;
  stdoutLog(`Launched 'serve' on port '${SERVE_PORT}' at pid '${serveProc.pid}'`);

  try {
    stdoutLog(`Trying to kill 'verdaccio' by port '${VERDACCIO_PORT}'`);
    await killPort(VERDACCIO_PORT);
    stdoutLog(`Killed 'verdaccio' by port '${VERDACCIO_PORT}'`);
  } catch {
    stdoutLog(`Didn't find 'verdaccio' by port '${VERDACCIO_PORT}'`);
  }
  stdoutLog(`Launching 'verdaccio' on port '${VERDACCIO_PORT}'...`);
  const verdaccioProc = crossSpawn('npm', ['run', 'verdaccio']);
  if (verdaccioProc.stdout) {
    await waitForTextInStream(`:${VERDACCIO_PORT}`, verdaccioProc.stdout, 180000);
  }
  globalThis.e2eGlobal.verdaccioPid = verdaccioProc.pid;
  stdoutLog(`Launched 'verdaccio' on port '${VERDACCIO_PORT}' at pid '${verdaccioProc.pid}'`);

  stdoutLog(`Preparing package '${PKG_NAME}' in 'verdaccio'...`);

  throwErrIfNpmErr(
    crossSpawn.sync('npx', [
      '-y',
      'npm-cli-login@1',
      '-u',
      VERDACCIO_U,
      '-p',
      VERDACCIO_P,
      '-e',
      VERDACCIO_E,
      '-r',
      VERDACCIO_ORIGIN,
    ]),
    'Failed to login npm'
  );

  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['unpublish', PKG_NAME, '-f', '--registry', VERDACCIO_ORIGIN]),
    `Failed to unpublish '${PKG_NAME}'`
  );

  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['publish', '--registry', VERDACCIO_ORIGIN, '--tag', PKG_TAG_E2E]),
    `Failed to publish '${PKG_NAME}'`
  );

  stdoutLog(`Prepared package '${PKG_NAME}' in 'verdaccio'`);

  await require(puppeteerPreset.globalSetup)(globalConfig);
};
