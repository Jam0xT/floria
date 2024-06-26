import Length from '../length.js';
import * as util from '../../utility.js';
import { broadcast } from '../../render.js';

const back = {
	x: Length.u(-100),
	y: Length.u(-100),
	rx: Length.u(15),
	ry: Length.u(15),
	hover: false,
	page: '',
	onBroadcast: {
		'start': function() {
			const $ = this.var;
			$.x = new Length(0, 0, 30);
			$.y = new Length(0, 1, -30);
			this.moveTo($.x, new Length(0, 1, 30));
			$.page = 'start';
		},
		'room': function() {
			const $ = this.var;
			$.x = new Length(0, 0, 30);
			$.y = new Length(0, 1, 30);
			this.moveTo($.x, new Length(0, 1, -30));
			$.page = 'room';
		},
		'mouse_move': function(x, y) {
			const $ = this.var;
			if ( util.inRect(x, y, $.absx, $.absy, $.rx, $.ry) ) {
				util.setCursorStyle('pointer');
				$.hover = true;
			} else {
				util.setCursorStyle('default');
				$.hover = false;
			}
		},
		'mouse_down': function(x, y, buttons) {
			const $ = this.var;
			if ( util.inRect(x, y, $.absx, $.absy, $.rx, $.ry) && buttons.left ) {
				if ( $.page == 'room' ) {
					broadcast('start');
				}
			}
		},
	},
	renderFn: function(ctx) {
		const $ = this.var;
		if ( $.hover ) {
			ctx.beginPath();
			ctx.rect($.rx.mul(-1).parse(), $.ry.mul(-1).parse(),
				$.rx.mul(2).parse(), $.ry.mul(2).parse());
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.fill();
		}

		let fontSize = Length.u(30).parse(), outlineWidth = fontSize / 8;

		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('<', 0, Length.u(10).parse());
	}
}

export {
	back,
}