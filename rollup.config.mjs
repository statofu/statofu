import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

/**
 * @typedef {import("rollup").RollupOptionsFunction} RollupOptionsFunction
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").OutputOptions} OutputOptions
 */

const name = 'statofu';
const outDir = 'dist';
const bundle = process.env.BUNDLE === 'true';

/**
 * @type {RollupOptionsFunction}
 */
export default (cliArgs) => {
  /** @type {ModuleFormat} */
  const format = cliArgs.format;

  const outputFilename = `${name}.${format}${bundle ? '.bundle' : ''}`;

  /** @type {OutputOptions} */
  const outputNormal = {
    file: `${outDir}/${outputFilename}.js`,
    format,
    name,
    sourcemap: true,
  };

  /** @type {OutputOptions} */
  const outputCompressed = {
    ...outputNormal,
    file: `${outDir}/${outputFilename}.min.js`,
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
    input: 'src/index.ts',
    output: [outputNormal, outputCompressed],
    plugins: [
      bundle && nodeResolve(),
      bundle && commonjs(),
      typescript({
        tsconfig: 'additional-configs/tsconfig.rollup.json',
      }),
    ].filter(Boolean),
  };
};
