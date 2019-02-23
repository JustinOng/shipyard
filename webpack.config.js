const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./public/js/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  plugins: [
    new CopyPlugin([
      { 
        from: "./public/index.html", to: "./"
      }
    ])
  ],
  devtool: "source-map"
};