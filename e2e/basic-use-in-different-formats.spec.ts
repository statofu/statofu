import fs from 'node:fs';

import crossSpawn from 'cross-spawn';

import { throwErrIfNpmErr } from './helpers';
import { PKG_NAME, SERVE_ORIGIN, VERDACCIO_ORIGIN } from './helpers/constants';

const PREV_DIR = process.cwd();

const BASE_DIR = 'e2e/fixtures/basic-use-in-different-formats';

const BASE_URL = `${SERVE_ORIGIN}/${BASE_DIR}`;

const OUTPUT_REG = /"a":"a\+".*"a":"a".*"a":"a\+".*"a":"a\+\+"/;

beforeAll(() => {
  process.chdir(BASE_DIR);
  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['uninstall', '--no-save', PKG_NAME]),
    `Failed to uninstall '${PKG_NAME}'`
  );
  ['dist', 'package-lock.json'].forEach((p) => {
    try {
      fs.rmSync(p, { recursive: true });
    } catch {}
  });
  throwErrIfNpmErr(
    crossSpawn.sync('npm', ['i', '--registry', VERDACCIO_ORIGIN]),
    'Failed to install deps'
  );
  throwErrIfNpmErr(crossSpawn.sync('npx', ['webpack']), 'Webpack failure');
});

afterAll(() => {
  process.chdir(PREV_DIR);
});

describe('on browser', () => {
  [
    'bundle-cjs',
    'bundle-esm-by-default',
    'bundle-umd',
    'module-script-esm',
    'plain-script-umd',
  ].forEach((format) => {
    test(`in format '${format}'`, async () => {
      await page.goto(`${BASE_URL}/public/index.browser-${format}.html`);
      await expect(page).toMatchElement('#root', { text: OUTPUT_REG });
    });
  });
});

describe('on node', () => {
  ['import-cjs-by-default', 'require-cjs-by-default'].forEach((format) => {
    test(`in format '${format}'`, () => {
      const mainPrefix = `src/index.node-${format}`;
      const mainFile = [`${mainPrefix}.js`, `${mainPrefix}.mjs`].find((p) => fs.existsSync(p));
      if (!mainFile) {
        throw new Error('Main file not found');
      }
      const { stdout } = crossSpawn.sync('node', [mainFile], { encoding: 'utf8' });
      expect(stdout).toMatch(new RegExp(OUTPUT_REG, 's'));
    });
  });
});
