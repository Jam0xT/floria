import Menu from './menu.js';
import * as util from '../utility.js';

export default class Button extends Menu {
	constructor(options) {
		super(options);
		this.isTrigger = options.isTrigger || false; // 是否为开关式按钮
		this.onTriggerFn = options.onTriggerFn || util.nop; // 触发/开关式按钮开启
		this.offTriggerFn = options.offTriggerFn || util.nop; // 开关式按钮关闭
		this.onHoverFn = options.onHoverFn || util.nop;
		this.offHoverFn = options.offHoverFn || util.nop;
		this.outRangeFn = options.outRangeFn || util.nop;
		
		this.on = false; // 切换式按钮是否按下
		this.hover = false;
		this.init();
	}

	init() {
		window.addEventListener('mousemove', this.onHover.bind(this));
		window.addEventListener('mousedown', this.onMouseDown.bind(this));
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
	}
	
	onHover(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
			if ( !this.hover ) {
				util.setCursorStyle('pointer');
				if ( !this.on ) {
					this.fillColor = this.style.hover;
				}
				this.onHoverFn(e);
				this.hover = true;
			}
		} else {
			if ( this.hover ) {
				util.setCursorStyle('default');
				if ( !this.on ) {
					this.fillColor = this.style.fill;
				}
				this.offHoverFn(e);
				this.hover = false;
			}
		}
	}

	onMouseDown(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
			if ( this.isTrigger ) {
				if ( this.on ) {
					this.offTriggerFn(e);
					this.fillColor = this.style.fill;
					this.on = false;
				} else {
					this.onTriggerFn(e);
					this.fillColor = this.style.click;
					this.on = true
				}
			} else {
				this.onTriggerFn(e);
				this.fillColor = this.style.click;
			}
		} else {
			this.outRangeFn(e);
		}
	}

	onMouseUp(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX * dpr, y = e.clientY * dpr;
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
			if ( !(this.isTrigger && this.on) ) {
				this.fillColor = this.style.hover;
			}
		}
	}
}