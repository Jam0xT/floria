import Length from './length.js';
import * as util from '../utility.js';

export default class Menu {
	constructor(options) {
		this.x = options.x;
		this.y = options.y;
		this.rx = options.rx; // 横向半径
		this.ry = options.ry; // 竖向半径
		this.renderFn = options.renderFn; // 渲染除了纯色填充之外的图案
		this.style = options.style; // 样式

		this.onOpenFn = options.onOpenFn; // 打开菜单
		this.onCloseFn = options.onCloseFn; // 关闭菜单

		this.fillColor = this.style.fill; // 填充颜色
		this.on = false; // 菜单是否打开
		this.children = [];

		this.parent = options.parent;
		this.parentMenu = undefined;

		this.isInitialHiding = options.isInitialHiding;

		this.transparency = options.transparency || 0;

		this.transparencyGen = undefined;
		this.xGen = undefined;
		this.yGen = undefined;
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