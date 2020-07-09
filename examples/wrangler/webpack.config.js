module.exports = {
  target: "webworker",
  entry: "./index.js",
  mode: "production",
  optimization: {
    // We no not want to minimize our code.
    minimize: false,
  },
};
