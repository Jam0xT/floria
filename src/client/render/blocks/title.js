import * as util from '../../utility.js';
import Length from '../length.js';

const title = {
	onBroadcast: {
		'start': function() {
			this.activate();
			this.var.x = new Length(0.5, 0, 0);
			this.var.y = new Length(0, 0, -50);
			this.moveTo(this.var.x, new Length(0, 0.3, 0));
		}
	},
	renderFn: function(ctx) {
		util.renderText(ctx, 1,
			'floria.io',
			Length.u(0), Length.u(0),
			Length.u(50),
			'center',
			'white',
		);
	},
};

export {
	title,
};