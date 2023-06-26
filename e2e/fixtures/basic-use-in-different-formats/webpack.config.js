/**
 * @type {import("webpack").Configuration}
 */
const webpackConf = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    'index.browser-bundle-cjs': './src/index.browser-bundle-cjs.ts',
    'index.browser-bundle-esm-by-default': './src/index.browser-bundle-esm-by-default.ts',
    'index.browser-bundle-umd': './src/index.browser-bundle-umd.ts',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['babel-loader', 'ts-loader'],
      },
      {
        test: /\.[cm]?js$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.cjs', '.mjs', '...'],
  },
};

module.exports = webpackConf;
