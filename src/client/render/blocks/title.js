import * as util from '../../utility.js';
import Length from '../length.js';

const title = {
	onBroadcast: {
		'init': function() {
			const $ = this.var;
			$.x = new Length(0.5, 0, 0);
			$.y = new Length(0, 0, -50);
			this.moveTo($.x, new Length(0, 0.3, 0));
		},
		'room': function() {
			const $ = this.var;
			this.moveTo($.x, new Length(0, 0, -50));
		},
		'start': function() {
			const $ = this.var;
			this.moveTo($.x, new Length(0, 0.3, 0));
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
},
title_small = {
	x: Length.u(-100),
	y: Length.u(-100),
	onBroadcast: {
		'room': function() {
			const $ = this.var;
			$.x = new Length(0, 0, 45);
			$.y = new Length(0, 0, -25);
			this.moveTo($.x, new Length(0, 0, 25));
		},
		'start': function() {
			const $ = this.var;
			this.moveTo($.x, new Length(0, 0, -25));
		},
	},
	renderFn: function(ctx) {
		util.renderText(ctx, 0.7,
			'floria.io',
			Length.u(0), Length.u(0),
			Length.u(20),
			'center',
			'white',
		);
	}
}

export {
	title,
	title_small,
};