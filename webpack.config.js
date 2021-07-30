const path = require('path')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')
const nodeExternals = require('webpack-node-externals')

const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

module.exports = {
  entry: [path.resolve(__dirname, 'src', 'server.ts')],
  target: 'node',
  output: {
    filename: 'server.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: isProd ? 'production' : 'development',
  resolve: {
    extensions: ['.ts', '.ts', '.js', '.js'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
      shared: path.resolve(__dirname, './shared'),
    },
  },
  externals: [nodeExternals()],
  devtool: isProd ? false : 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, './shared'),
        ],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false,
    }),
    new Dotenv(),
  ],
}
