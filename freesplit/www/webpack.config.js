const CopyWebpackPlugin = require("copy-webpack-plugin");
// const ElmPlugin = require("elm-webpack-loader");
const path = require('path');

module.exports = {
  entry: "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(['index.html'])
//    , new ElmPlugin(['Main.elm'])
  ],
  module: {
    rules: [{
      test: /\.elm$/,
      exclude: [/elm-stuff/, /node_modules/],
      loader: 'elm-webpack-loader'
    }]
  }
};
