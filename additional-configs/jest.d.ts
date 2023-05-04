/// <reference types="jest-extended" />
/// <reference types="jest-puppeteer" />
/// <reference types="expect-puppeteer" />

declare module 'ts-jest/presets/js-with-ts/jest-preset' {
  const preset: object;
  export = preset;
}

declare module 'jest-puppeteer/jest-preset' {
  const preset: object;
  export = preset;
}

var e2eGlobal:
  | {
      servePid?: number;
      verdaccioPid?: number;
    }
  | undefined;
