import * as canvas from '../canvas.js';
import * as util from '../../utility.js';
import styles from '../styles.js';

const background = {
	onBroadcast: {
		'start': function() {
			this.activate();
		}
	},
	renderFn: function(ctx) {
		util.fillBackground(ctx, styles.background.menu);
	},
};

export {
	background,
};