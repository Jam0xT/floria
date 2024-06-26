import Length from '../length.js';
import * as util from '../../utility.js';
import * as input from '../input.js';

const room = {
	x: Length.u(-1000),
	y: Length.u(-1000),
	onBroadcast: {
		'room': function() {
			const $ = this.var;
			$.x = new Length(0.5, 0, 0);
			$.y = new Length(0, 1, 60);
			this.moveTo($.x, new Length(0, 0.3, 0));
		},
		'start': function() {
			const $ = this.var;
			this.moveTo($.x, new Length(0, 1, 60));
		},
	},
	renderFn: function(ctx) {
		let fontSize = Length.u(30).parse(), outlineWidth = fontSize / 8;
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('Room', 0, 0);
	},
	children: [
		'room_join',
		'room_create',
		'room_id_input',
	],
},

room_join = {
	x: Length.u(0),
	y: Length.u(30),
	rx: Length.u(40),
	ry: Length.u(15),
	hover: false,
	onBroadcast: {
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
				// broadcast('room');
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

		let fontSize = Length.u(20).parse(), outlineWidth = fontSize / 8;

		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('Join', 0, Length.u(8).parse());
	}
},

room_create = {
	x: Length.u(0),
	y: Length.u(60),
	rx: Length.u(40),
	ry: Length.u(15),
	hover: false,
	onBroadcast: {
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
				// broadcast('room');
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

		let fontSize = Length.u(20).parse(), outlineWidth = fontSize / 8;

		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('Create', 0, Length.u(8).parse());
	}
},

room_id_input = {
	x: Length.u(0),
	y: Length.u(90),
	rx: Length.u(55),
	ry: Length.u(20),
	hover: false,
	onBroadcast: {
		'init': function() {
			input.init.bind(this)({maxTextLength: 6});
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
		fontSize = Length.u(20).parse(), outlineWidth = fontSize / 8;
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.lineWidth = outlineWidth;
		ctx.font = `${fontSize}px PT SANS`;
		ctx.fillText('#', -$.rx.add(Length.u(7)).parse(), Length.u(10).parse());
	},
};


export {
	room,
	room_join,
	room_create,
	room_id_input,
}