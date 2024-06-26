import * as util from '../../utility.js';

const main = {
	onBroadcast: {
		'init': function() {
			this.var.alpha = 0;
			this.appendGen('alpha100', util.gen.logarithmic_increase(0, 100, 0.93));
			// this.activate(false);
		}
	},
	updateFn: function() {
		this.var.alpha = this.getGenVal('alpha100') * 0.01 ?? 1;
	},
	children: [
		'background',
		'title',
		'arena',
		'title_small',
		'name_input',
		'room',
		'back',
	],
};

export {
	main,
}