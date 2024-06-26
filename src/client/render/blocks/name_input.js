import Length from '../length.js';
import * as util from '../../utility.js';
import * as input from '../input.js';
import * as room from '../room.js';

const name_input = {
	rx: Length.u(50),
	ry: Length.u(20),
	hover: false,
	onBroadcast: {
		'init': function() {
			const $ = this.var;
			$.x = new Length(0.5, 0, 0);
			$.y = new Length(0, 0, -50);
			this.moveTo($.x, new Length(0, 0.4, 0));
			input.init.bind(this)({maxTextLength: 15});
			$.input.text = util.getStorage('username', '');
			$.input.arrow = $.input.text.length;
		},
		'start': function() {
			const $ = this.var;
			$.x = new Length(0.5, 0, 0);
			$.y = new Length(0, 0, -50);
			this.moveTo($.x, new Length(0, 0.4, 0));
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
			if ( buttons.left ) {
				if ( util.inRect(x, y, $.absx, $.absy, $.rx, $.ry) ) {
					input.focus.bind(this)();
				} else {
					input.focus.bind(this)(false);
				}
			}
		},
		'key_down': function(e) {
			input.handleInput.bind(this)(e);
		},
		'room': function() {
			const $ = this.var;
			input.focus.bind(this)(false);
			util.setStorage('username', $.input.text);
			room.setUsername($.input.text);
			this.moveTo(this.var.x, new Length(0, 0, -50));
		},
	},
	renderFn: function(ctx) {
		const $ = this.var;

		// 下划线
		ctx.beginPath();
		ctx.moveTo(-$.rx.parse(), Length.u(15).parse());
		ctx.lineTo($.rx.parse(), Length.u(15).parse());
		ctx.lineWidth = Length.u(2).parse();
		ctx.strokeStyle = '#FFFFFF';
		ctx.stroke();
		ctx.render

		// 输入的用户名
		let fontSize = Length.u(20).parse(), outlineWidth = fontSize / 8;
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText($.input.text, 0, Length.u(10).parse());

		// 提示文字
		fontSize = Length.u(10).parse(), outlineWidth = fontSize / 8;
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('This pretty little flower is called...', 0, Length.u(-10).parse());
	},
};

export {
	name_input,
};