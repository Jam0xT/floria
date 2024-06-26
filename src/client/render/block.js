import Length from './length.js';

import * as util from '../utility.js';

import * as canvas from './canvas.js';

import { blocks } from '../render.js';

import { localRenderDelay } from '../render.js';

class Block {
	constructor(properties) { // 初始设置
		this.var = properties;
		this.var.on = true;
		this.var.x ??= Length.u(0);
		this.var.y ??= Length.u(0);
		this.var.absx ??= Length.u(0);
		this.var.absy ??= Length.u(0);
		this.var.upd = [];
	}

	activate(includeChild = true) { // child: 是否激活子 block
		this.var.on = true; // 激活

		if ( !includeChild ) // 不激活子 block
			return ;

		const children = this.var.children ??= []; // 获取子 block id 序列 没有则设为空序列

		children.forEach(child => { // 激活子 block
			blocks[child].activate();
		});
	}

	update(x = new Length(0, 0, 0), y = new Length(0, 0, 0)) { // 更新
		if ( !this.var.on )
			return ;

		const $ = this.var;

		$.t = Date.now();
		$.absx = x.add($.x);
		$.absy = y.add($.y);

		// $.upd.push({
		// 	t: $.t,
		// 	absx: $.absx,
		// 	absy: $.absy,
		// 	// alpha: $.alpha,
		// // });

		// const baseUpdIdx = this.getBaseUpdIdx();

		// if ( baseUpdIdx > 0 )
		// 	$.upd.splice(0, baseUpdIdx);

		const updateFn = $.updateFn ??= util.nop; // 获取更新函数 没有则设为 nop

		const genList = $.genList ??= []; // 获取生产函数列表 没有则设为空序列

		Object.keys(genList).forEach(genKey => { // 更新生成函数
			genList[genKey].res = genList[genKey].gen.next(); // 生成函数执行
		});

		this.updateMove();

		updateFn.bind(this)(); // 更新

		const children = $.children ??= []; // 获取子 block id 序列 没有则设为空序列

		children.forEach(child => { // 更新子 block
			blocks[child].update($.absx, $.absy);
		});

		Object.keys(genList).forEach(genKey => { // 删除用完的生成函数
			let res = genList[genKey].res;
			if ( res.done ) { // 如果生成函数已用完
				delete genList[genKey]; // 删除该生成函数
			}
		});
	}

	getBaseUpdIdx() {
		const $ = this.var;
		const serverTime = this.getLocalServerTime();
		for (let i = $.upd.length - 1; i >= 0; i--) {
			if ( $.upd[i].t <= serverTime ) {
				return i;
			}
		}
		return -1;
	}

	getLocalServerTime() {
		return Date.now() - localRenderDelay;
	}

	getInterpolated(key) {
		const $ = this.var;
		const serverTime = this.getLocalServerTime();

		const baseUpdIdx = this.getBaseUpdIdx();

		if ( baseUpdIdx < 0 || baseUpdIdx == $.upd.length - 1 ) {
			return $.upd[$.upd.length - 1][key];
		} else {
			const baseUpd = $.upd[baseUpdIdx];
			const nextUpd = $.upd[baseUpdIdx + 1];
			const ratio = (serverTime - baseUpd.t) / (nextUpd.t - baseUpd.t);
			if ( baseUpd[key].constructor.name == 'Length' ) {
				return baseUpd[key].add(nextUpd[key].sub(baseUpd[key]).mul(ratio));
			} else {
				return baseUpd[key] + (nextUpd[key] - baseUpd[key]) * ratio;
			}
		}
	}

	updateMove() { // 更新移动情况
		if ( this.var.genList['x'] ) {
			if ( this.var.genList['x'].res.done ) {
				this.var.x = this.var.toX;
			} else {
				this.var.x = Length.parseVal(this.var.genList['x'].res.value);
			}
		}
		if ( this.var.genList['y'] ) {
			if ( this.var.genList['y'].res.done ) {
				this.var.y = this.var.toY;
			} else {
				this.var.y = Length.parseVal(this.var.genList['y'].res.value);
			}
		}
	}

	moveTo(x, y, k = 0.85) { // 移动到 x, y; k 越小 速度越快
		this.var.toX = x;
		this.var.toY = y;
		// 设置 x 方向生成函数
		if ( this.var.x.lessThan(x) ) {
			this.appendGen('x',
				util.gen.logarithmic_increase(
					this.var.x.parse(),
					x.parse(),
					k
				)
			);
		} else if ( this.var.x.greaterThan(x) ) {
			this.appendGen('x',
				util.gen.exponential_decrease(
					this.var.x.parse(),
					x.parse(),
					k
				)
			);
		}
		// 设置 y 方向生成函数
		if ( this.var.y.lessThan(y) ) {
			this.appendGen('y',
				util.gen.logarithmic_increase(
					this.var.y.parse(),
					y.parse(),
					k
				)
			);
		} else if ( this.var.y.greaterThan(y) ) {
			this.appendGen('y',
				util.gen.exponential_decrease(
					this.var.y.parse(),
					y.parse(),
					k
				)
			);
		}
	}

	appendGen(key, gen) { // 添加新的生成函数
		const genList = this.var.genList ??= {};
		genList[key] = {
			gen: gen,
		};
	}

	getGenVal(key) { // 获取生成函数的值
		if ( this.var.genList[key] )
			return this.var.genList[key].res.value;
		return undefined;
	}

	isGenDone(key) { // 获取生成函数是否结束
		if ( this.var.genList[key] )
			return this.var.genList[key].res.done;
		return undefined;
	}

	render(ctx_) { // 渲染该 block 及其子 block
		if ( !this.var.on )
			return ;

		const $ = this.var;

		const ctx = canvas.getTmpCtx(); // 获取临时 ctx

		const renderFn = $.renderFn ??= util.nop; // 获取渲染函数 没有设置则设为 nop

		ctx.save();

		// console.log(this.getInterpolated('absx'));
		ctx.translate($.absx.parse(), $.absy.parse()); // 移动到渲染位置

		renderFn.bind(this)(ctx);

		ctx.restore();

		const children = $.children ??= []; // 获取子 block id 序列 没有则设为空序列

		children.forEach(child => { // *依次* 渲染子 block
			blocks[child].render(ctx);
		});

		ctx_.save();
		ctx_.globalAlpha = $.alpha ??= 1; // 设置透明度
		canvas.draw(ctx, ctx_); // 复制到原 ctx
		ctx_.restore();
	}

	onBroadcast(msg, ...args) { // 接收到广播消息 msg
		if ( this.var.onBroadcast ) { // 防止没有设置 onBroadcast
			const onBroadcastFn = this.var.onBroadcast[msg];
			if ( onBroadcastFn ) // 如果设置了对这条消息的 onBroadcastFn
				onBroadcastFn.bind(this)(...args);
		}
	}
}

export default Block;