import Menu from './menu.js';
import * as util from '../utility.js';

export default class Button extends Menu {
	constructor(x, y, align, rx, ry, renderFn, style, onOpenFn, onCloseFn, transparency = 0) {
		super(x, y, align, rx, ry, renderFn, style, onOpenFn, onCloseFn, transparency);
		this.isTrigger = false; // 是否为开关式按钮
		this.onTriggerFn = util.nop; // 触发/开关式按钮开启
		this.offTriggerFn = util.nop; // 开关式按钮关闭
		this.onHoverFn = util.nop;
		this.offHoverFn = util.nop;

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
}