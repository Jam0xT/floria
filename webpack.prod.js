import { merge } from 'webpack-merge';
import common from './webpack.common';
// optimization?

export default merge(common, {
	mode: "production",
});