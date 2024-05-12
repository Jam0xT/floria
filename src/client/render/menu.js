import Length from './length.js';
import * as util from '../utility.js';

export default class Menu {
	constructor(x, y, rx, ry, renderFn, style, onOpenFn, onCloseFn, parent, isInitialHiding, isButton, transparency = 0) {
		this.x = x;
		this.y = y;
		this.rx = rx; // 横向半径
		this.ry = ry; // 竖向半径
		this.renderFn = renderFn; // 渲染除了纯色填充之外的图案
		this.style = style; // 样式

		this.onOpenFn = onOpenFn; // 打开菜单
		this.onCloseFn = onCloseFn; // 关闭菜单

		this.fillColor = this.style.fill; // 填充颜色
		this.on = false; // 菜单是否打开
		this.children = [];

		this.parent = parent;
		this.parentMenu = undefined;

		this.isInitialHiding = isInitialHiding;

		this.transparency = transparency;

		this.transparencyGen = undefined;
		this.xGen = undefined;
		this.yGen = undefined;

		if ( isButton ) {
			this.isTrigger = false; // 是否为开关式按钮
			this.onTriggerFn = util.nop; // 触发/开关式按钮开启
			this.offTriggerFn = util.nop; // 开关式按钮关闭
			this.onHoverFn = util.nop;
			this.offHoverFn = util.nop;

			this.on = false; // 切换式按钮是否按下
			this.hover = false;
			this.init();
		}
	}

	append(children, array = false) {
		if ( array ) {
			children.forEach(child => {
				this.children.push(child);
			});
		} else {
			this.children.push(children);
		}
	}

	render(ctx) {
		ctx.save();

		this.handleGen();
		util.Tl(ctx, this.x, this.y); // o中心

		util.blendAlpha(ctx, util.parseTransparency(this.transparency));

		util.renderRoundRect(ctx,
			this.rx.mul(-1), this.ry.mul(-1),
			this.rx.mul(2), this.ry.mul(2),
			[Length.u(this.style.arcRadius)],
		);

		if ( this.style.outline_width != 0 ) {
			ctx.lineWidth = Length.u(this.style.outline_width).parse();
			ctx.stroke();
		}

		ctx.fillStyle = this.fillColor;
		ctx.fill();

		util.Tl(ctx, this.rx.mul(-1), this.ry.mul(-1)); // o左上角

		if ( this.renderFn ) { // 防止无渲染函数因为undefined.bind报错
			this.renderFn.bind(this)(ctx);
		}

		util.Tl(ctx, this.rx, this.ry); // o左上角

		this.children.forEach(child => {
			child.render(ctx);
		});

		ctx.restore();
	}

	handleGen() {
		if ( this.transparencyGen ) {
			this.transparencyGen.val = this.transparencyGen.gen.next();
			if ( !this.transparencyGen.val.done ) {
				this.transparency = this.transparencyGen.val.value;
			}
		}

		if ( this.xGen ) {
			this.xGen.val = this.xGen.gen.next();
			if ( !this.xGen.val.done ) {
				this.x = Length.parseVal(this.xGen.val.value);
			}
		}

		if ( this.yGen ) {
			this.yGen.val = this.yGen.gen.next();
			if ( !this.yGen.val.done ) {
				this.y = Length.parseVal(this.yGen.val.value);
			}
		}
	}

	open(initial = false) {
		if ( !(this.isInitialHiding && initial) ) {
			this.onOpenFn();
		}
	}

	close() {
		this.onCloseFn();
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
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
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
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
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
		if ( util.inRange(x, this.getX().sub(this.rx).parse(), this.getX().add(this.rx).parse())
			&& util.inRange(y, this.getY().sub(this.ry).parse(), this.getY().add(this.ry).parse()) ) {
			if ( !(this.isTrigger && this.on) ) {
				this.fillColor = this.style.hover;
			}
		}
	}

	getX() {
		if ( this.parent == 'root' )
			return this.x;
		else
			return this.parentMenu.x.add(this.x);
	}

	getY() {
		if ( this.parent == 'root' )
			return this.y;
		else
			return this.parentMenu.y.add(this.y);
	}
}