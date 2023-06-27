/**
 * @type {import("webpack").Configuration}
 */
const webpackConf = {
  context: __dirname,
  mode: 'development',
  devtool: 'source-map',
  entry: {
    'index.browser-bundle-esm-by-default': './src/index.browser-bundle-esm-by-default.ts',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              configFile: __dirname + '/tsconfig.json',
            },
          },
        ],
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
