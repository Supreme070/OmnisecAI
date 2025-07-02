const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: './src/main/main.ts',
  mode: process.env.NODE_ENV || 'development',
  devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/main': path.resolve(__dirname, 'src/main'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    'electron': 'commonjs electron',
    'electron-updater': 'commonjs electron-updater',
    'electron-store': 'commonjs electron-store',
    'electron-log': 'commonjs electron-log',
    'node-notifier': 'commonjs node-notifier',
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
};