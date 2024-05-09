import { Length } from './canvas.js';
import * as util from '../utility.js';

export {
	Menu
};

class Menu {
	constructor(x, y, align, rx, ry, renderFn, style, onOpenFn, onCloseFn, transparency = 0) {
		this.x = x;
		this.y = y;
		this.align = align;
		this.rx = rx; // 横向半径
		this.ry = ry; // 竖向半径
		this.renderFn = renderFn; // 渲染除了纯色填充之外的图案
		this.style = style; // 样式

		this.onOpenFn = onOpenFn; // 打开菜单
		this.onCloseFn = onCloseFn; // 关闭菜单

		this.fillColor = this.style.fill; // 填充颜色
		this.on = false; // 菜单是否打开
		this.children = [];
		this.transparency = transparency;

		this.transparencyGen = undefined;
	}

	append(child) {
		this.children.push(child);
	}

	render(ctx) {
		let alpha = ctx.globalAlpha;
		this.translate(ctx);

		if ( this.transparencyGen ) {
			this.transparencyGen.val = this.transparencyGen.gen.next();
			if ( !this.transparencyGen.val.done ) {
				this.transparency = this.transparencyGen.val.value;
			}
		}
		ctx.globalAlpha = util.parseTransparency(this.transparency);

		util.renderRoundRect(ctx,
			this.x.sub(this.rx), this.y.sub(this.ry),
			this.rx.mul(2), this.ry.mul(2),
			[Length.u(this.style.arcRadius)],
		);

		if ( this.style.outline_width != 0 ) {
			ctx.lineWidth = this.style.outline_width;
			ctx.stroke();
		}

		ctx.fillStyle = this.fillColor;
		ctx.fill();

		this.renderFn.bind(this)();
		this.children.forEach(child => {
			child.render();
		});

		ctx.globalAlpha = alpha;
		this.translate(ctx, true);
	}

	translate(ctx, revert = false) {
		let translateX = 0, translateY = 0;
		if ( this.align.x == 'start' )
			translateX = this.rx.parse();
		if ( this.align.x == 'end' )
			translateX = -this.rx.parse();
		if ( this.align.y == 'start' )
			translateY = this.ry.parse();
		if ( this.align.y == 'end' )
			translateY = -this.ry.parse();
		if ( revert ) {
			translateX = -translateX;
			translateY = -translateY;
		}
		ctx.transform(1, 0, 0, 1, translateX, translateY);
	}
}