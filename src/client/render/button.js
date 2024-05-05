import styles from './styles.js';
import { Length } from './canvas.js';
import * as util from '../utility.js';

export {
	Button
};

class Button {
	constructor(x, y, align, rx, ry, renderFn, style = styles.button.default) {
		this.x = x;
		this.y = y; // 坐标
		this.align = align; // 对齐方式
		this.rx = rx; // 横向半径
		this.ry = ry; // 竖向半径
		this.renderFn = renderFn; // 渲染除了纯色填充之外的图案
		this.style = style; // 样式

		this.isTrigger = false; // 是否为开关式按钮
		this.onTriggerFn = util.nop; // 触发/开关式按钮开启
		this.offTriggerFn = util.nop; // 开关式按钮关闭
		this.onHoverFn = util.nop;
		this.offHoverFn = util.nop;

		this.fillColor = this.style.fill; // 填充颜色
		this.on = false; // 切换式按钮是否按下
		this.hover = false;
		this.init();
	}

	init() {
		window.addEventListener('mousemove', this.onHover.bind(this));
		window.addEventListener('mousedown', this.onMouseDown.bind(this));
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
	}

	setOnTriggerFn(onTriggerFn) { // 触发/开关式按钮开启
		this.onTriggerFn = onTriggerFn;
	}

	setOffTriggerFn(offTriggerFn) { // 开关式按钮关闭
		this.isTrigger = true;
		this.offTriggerFn = offTriggerFn;
	}

	setOnHoverFn(onHoverFn, offHoverFn) {
		this.onHoverFn = onHoverFn;
		this.offHoverFn = offHoverFn;
	}

	onHover(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.x.sub(this.rx).parse(), this.x.add(this.rx).parse())
			&& util.inRange(y, this.y.sub(this.ry).parse(), this.y.add(this.ry).parse()) ) {
			if ( !this.hover ) {
				util.setCursorStyle('pointer');
				if ( !this.on ) {
					this.fillColor = this.style.hover;
				}
				this.onHoverFn();
				this.hover = true;
			}
		} else {
			if ( this.hover ) {
				util.setCursorStyle('default');
				if ( !this.on ) {
					this.fillColor = this.style.fill;
				}
				this.offHoverFn();
				this.hover = false;
			}
		}
	}

	onMouseDown(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.x.sub(this.rx).parse(), this.x.add(this.rx).parse())
			&& util.inRange(y, this.y.sub(this.ry).parse(), this.y.add(this.ry).parse()) ) {
			if ( this.isTrigger ) {
				if ( this.on ) {
					this.offTriggerFn();
					this.fillColor = this.style.fill;
				}
			} else {
				this.onTriggerFn();
				this.fillColor = this.style.click;
			}
		}
	}

	onMouseUp(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.x.sub(this.rx).parse(), this.x.add(this.rx).parse())
			&& util.inRange(y, this.y.sub(this.ry).parse(), this.y.add(this.ry).parse()) ) {
			if ( !(this.isTrigger && this.on) ) {
				this.fillColor = this.style.hover;
			}
		}
	}

	render(ctx) {
		this.translate(ctx);
		util.renderRoundRect(ctx,
			this.x.sub(this.rx), this.y.sub(this.ry),
			this.rx.mul(2), this.ry.mul(2),
			Length.u(this.style.arcRadius),
		);
		ctx.lineWidth = this.style.outline_width;
		ctx.stroke();
		ctx.fillStyle = this.fillColor;
		ctx.fill();
		this.renderFn(this.x, this.y);
	}

	translate(ctx, revert = false) {
		let translateX = 0, translateY = 0;
		if ( this.align.x == 'start' )
			translateX = this.rx;
		if ( this.align.x == 'end' )
			translateX = -this.rx;
		if ( this.align.y == 'start' )
			translateY = this.ry;
		if ( this.align.y == 'end' )
			translateY = -this.ry;
		if ( revert ) {
			translateX = -translateX;
			translateY = -translateY;
		}
		ctx.translate(translateX, translateY);
	}
}