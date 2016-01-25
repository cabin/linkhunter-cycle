const path = require('path');

module.exports = {
  entry: '.',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: path.resolve(__dirname, 'node_modules'),
    }, {
      test: /\.jade$/,
      loader: './jade-vtree-loader.js',
      exclude: path.resolve(__dirname, 'node_modules'),
    }, {
      test: /\.less$/,
      loader: 'style!css!autoprefixer!less',
      exclude: path.resolve(__dirname, 'node_modules'),
    }, {
      test: /\.css/,
      loader: 'style!css',
    }],
  },

  devServer: {
    historyApiFallback: true,
    port: 8087,
  },
};
