import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

/**
 * @typedef {import("rollup").RollupOptionsFunction} RollupOptionsFunction
 * @typedef {import("rollup").ModuleFormat} ModuleFormat
 * @typedef {import("rollup").OutputOptions} OutputOptions
 */

const pkgName = 'statofu';
const outputDir = 'dist';

/**
 * @type {RollupOptionsFunction}
 */
export default (cliArgs) => {
  /** @type {ModuleFormat} */
  const format = cliArgs.format;

  const outputFilename = `${pkgName}.${format}`;

  /** @type {OutputOptions} */
  const outputNormal = {
    file: `${outputDir}/${outputFilename}.js`,
    format,
    name: pkgName,
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
    file: `${outputDir}/${outputFilename}.min.js`,
    format,
    name: pkgName,
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
    input: 'src/index.ts',
    output: [outputNormal, outputCompressed],
    plugins: [
      typescript({
        compilerOptions: {
          ...(format === 'umd' ? { target: 'es5' } : {}),
        },
      }),
    ],
  };
};
