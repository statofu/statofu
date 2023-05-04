import path from 'node:path';

export const SERVE_PORT = 3030;
export const SERVE_ORIGIN = `http://127.0.0.1:${SERVE_PORT}`;

export const VERDACCIO_PORT = 7373;
export const VERDACCIO_ORIGIN = `http://127.0.0.1:${VERDACCIO_PORT}`;
export const VERDACCIO_U = 'statofu-e2e';
export const VERDACCIO_P = 'statofu1234';
export const VERDACCIO_E = 'statofu-e2e@statofu.local';

export const PKG_TAG_E2E = 'e2e-specific';
export const PKG_NAME = 'statofu';
export const PKG_DIR = path.resolve(__dirname + '/../..');
