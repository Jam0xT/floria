import * as util from '../../utility.js';
import Length from '../length.js';
import * as input from '../input.js';

const test = {
	rx: Length.u(50),
	ry: Length.u(10),
	fill: 'rgb(255, 255, 255)',
	mousedown: false,
	onBroadcast: {
		'start': function() {
			this.activate();
			this.var.x = new Length(0.5, 0, 0);
			this.var.y = new Length(0, 0, -50);
			this.moveTo(this.var.x, new Length(0, 0.5, 0));
			input.init.bind(this)();
		},
		'mouse_move': function(x, y) {
			if ( this.var.isValid.bind(this)(x, y) ) {
				util.setCursorStyle('pointer');
				if ( this.var.mousedown ) {
					this.var.fill = 'rgb(150, 150, 150)';
				} else {
					this.var.fill = 'rgb(210, 210, 210)';
				}
			} else {
				util.setCursorStyle('default');
				if ( this.var.input.focus ) {
					this.var.fill = 'rgb(210, 210, 210)';
				} else {
					this.var.fill = 'rgb(255, 255, 255)';
				}
			}
		},
		'mouse_down': function(x, y, buttons) {
			if ( buttons.left ) {
				this.var.mousedown = true;
				if ( this.var.isValid.bind(this)(x, y) ) {
					this.var.fill = 'rgb(150, 150, 150)';
					input.focus.bind(this)();
				} else {
					this.var.fill = 'rgb(255, 255, 255)';
					input.focus.bind(this)(false);
				}
			}
		},
		'mouse_up': function(x, y, buttons) {
			if ( buttons.left ) {
				this.var.mousedown = false;
				if ( this.var.isValid.bind(this)(x, y) ) {
					this.var.fill = 'rgb(210, 210, 210)';
				}
			}
		},
		'key_down': function(e) {
			input.handleInput.bind(this)(e);
		},
	},
	renderFn: function(ctx) {
		util.renderRoundRect(ctx,
			this.var.rx.mul(-1), this.var.ry.mul(-1),
			this.var.rx.mul(2), this.var.ry.mul(2),
			[Length.u(2)],
		);

		ctx.lineWidth = Length.u(3).parse();
		ctx.strokeStyle = 'rgb(0, 0, 0)';
		ctx.stroke();

		ctx.fillStyle = this.var.fill;
		ctx.fill();

		util.renderText(ctx, 1,
			this.var.input.text,
			Length.u(0), Length.u(8),
			Length.u(20),
			'center',
			'white',
		);
	},
	isValid: function(x, y) {
		return util.inRange(x, this.var.x.sub(this.var.rx).parse(), this.var.x.add(this.var.rx).parse())
			&& util.inRange(y, this.var.y.sub(this.var.ry).parse(), this.var.y.add(this.var.ry).parse());
	},
};

export {
	test,
};