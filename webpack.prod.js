import merge from "webpack-merge";
import common from "./webpack.common.js";
// optimization?

export default merge(common, {
	mode: "production",
});