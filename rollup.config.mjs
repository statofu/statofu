import path from 'node:path';

import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { camelCase, isEmpty } from 'lodash';

/**
 * @typedef {import("rollup").RollupOptionsFunction} RollupOptionsFunction
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").OutputOptions} OutputOptions
 */

const pkgName = 'statofu';
const inputDir = 'src';
const inputs = ['src/index.ts', 'src/ssr/index.ts'];
const outputDir = 'dist';

/**
 * @type {RollupOptionsFunction}
 */
export default (cliArgs) => {
  /** @type {ModuleFormat} */
  const format = cliArgs.format;

  return inputs.map((input) => {
    const inputName = evaluateInputName(input);
    const outputFilePrefix = evaluateOutputFilePrefix(input, format);

    /** @type {OutputOptions} */
    const outputNormal = {
      file: `${outputFilePrefix}.js`,
      format,
      name: inputName,
      sourcemap: true,
      plugins: [
        terser({
          format: { comments: false, beautify: true },
          compress: false,
          mangle: false,
        }),
      ],
    };

    /** @type {OutputOptions} */
    const outputCompressed = {
      file: `${outputFilePrefix}.min.js`,
      format,
      name: inputName,
      sourcemap: true,
      plugins: [
        terser({
          format: { comments: false },
          mangle: {
            properties: { regex: /^_/ },
          },
        }),
      ],
    };

    return {
      input,
      output: [outputNormal, outputCompressed],
      plugins: [
        typescript({
          compilerOptions: {
            ...(format === 'umd' ? { target: 'es5' } : {}),
          },
        }),
      ],
    };
  });
};

/**
 * @param {string} input
 * @returns {string}
 */
function evaluateInputName(input) {
  const { dir, name } = path.parse(path.relative(inputDir, input));
  return camelCase(
    [
      pkgName,
      ...(isEmpty(dir) ? [] : dir.split(/[\\/]/)),
      ...(name === 'index' ? [] : [name]),
    ].join('-')
  );
}

/**
 * @param {string} input
 * @param {ModuleFormat} format
 * @returns {string}
 */
function evaluateOutputFilePrefix(input, format) {
  const { dir, name } = path.parse(path.relative(inputDir, input));

  if (isEmpty(dir)) {
    return path.join(outputDir, `${name === 'index' ? pkgName : name}.${format}`);
  } else {
    if (name === 'index') {
      return path.join(outputDir, `${dir}.${format}`);
    } else {
      return path.join(outputDir, dir, `${name}.${format}`);
    }
  }
}
