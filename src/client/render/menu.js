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
		this.xGen = undefined;
		this.yGen = undefined;
	}

	append(child) {
		this.children.push(child);
	}

	render(ctx) {
		let alpha = ctx.globalAlpha;
		this.alignCenter(ctx);

		if ( this.transparencyGen ) {
			this.transparencyGen.val = this.transparencyGen.gen.next();
			if ( !this.transparencyGen.val.done ) {
				this.transparency = this.transparencyGen.val.value;
			}
		}

		if ( this.xGen ) {
			this.xGen.val = this.xGen.gen.next();
			if ( !this.xGen.val.done ) {
				this.x = this.xGen.val.value;
			}
		}

		if ( this.yGen ) {
			this.yGen.val = this.yGen.gen.next();
			if ( !this.yGen.val.done ) {
				this.y = this.yGen.val.value;
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

		this.renderFn.bind(this)(ctx);
		this.children.forEach(child => {
			child.render();
		});

		ctx.globalAlpha = alpha;
		util.Tf0(ctx);
	}

	alignCenter(ctx, revert = false) {
		let translateX = Length.u(0), translateY = Length.u(0);
		if ( this.align.x == 'start' )
			translateX = this.rx;
		if ( this.align.x == 'end' )
			translateX = this.rx.mul(-1);
		if ( this.align.y == 'start' )
			translateY = this.ry;
		if ( this.align.y == 'end' )
			translateY = this.ry.mul(-1);
		if ( revert ) {
			translateX.mul(-1)
			translateY.mul(-1);
		}
		util.Tf(ctx, translateX, translateY);
	}
}