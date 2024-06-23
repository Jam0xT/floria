import * as util from '../../utility.js';

const main = {
	onBroadcast: {
		'start': function() {
			this.var.alpha = 0;
			this.appendGen('alpha100', util.gen.logarithmic_increase(0, 100, 0.93));
			this.activate(false);
		}
	},
	updateFn: function() {
		this.var.alpha = this.getGenVal('alpha100') * 0.01 ?? 1;
	},
	children: [],
};

export {
	main,
}