const merge = require("webpack-merge");
const common = require("./webpack.common.js");
// optimization?

module.exports = merge(common, {
	mode: "production",
})