import Length from '../length.js';

import styles from '../styles.js';

import Menu from '../menu.js';

import * as util from '../../utility.js';

export default function getMenus() {
	return {
		start: new Menu(
			Length.w(0), Length.h(0),
			{x: 'center', y: 'center'}	,
			Length.u(0), Length.u(0),
			util.nop(),
			styles.menu.invisible,
			function() {
				this.children.forEach(child => {
					child.open(true);
				});
			},
			function() {
				this.children.forEach(child => {
					child.close();
				});
			},
			'root',
			true,
			0,
		),
		start_tutorial: new Menu(
			Length.w(1).sub(Length.u(10)), Length.h(1).sub(Length.u(40)),
			{x: 'end', y: 'end'},
			Length.u(60), Length.u(40),
			function(ctx) { // 渲染函数
				ctx.save();
				util.Tl(ctx, Length.u(5), Length.u(13));
				util.renderText(ctx, ctx.globalAlpha,
					'Tutorial',
					Length.u(0), Length.u(0),
					Length.u(10),
					'left',
					'yellow',
				);
				util.Tl(ctx, Length.u(0), Length.u(10));
				util.renderText(ctx, ctx.globalAlpha,
					'Is for nobs. hehe',
					Length.u(0), Length.u(0),
					Length.u(8),
					'left',
					'white',
				);
				ctx.restore();
			},
			styles.menu.default,
			function() {
				this.transparencyGen = {
					gen: util.gen.exponential_decrease(this.transparency, 0, 0.8),
					val: {},
				};
			},
			function() {
				this.transparencyGen = {
					gen: util.gen.logarithmic_increase(this.transparency, 100, 0.75),
					val: {},
				};	
			},
			'start',
			true,
			100,
		),
		start_title: new Menu(
			Length.w(0.5), Length.h(0.4).sub(Length.u(200)),
			{x: 'center', y: 'center'},
			Length.u(0), Length.u(40),
			function(ctx) {
				util.renderText(ctx, ctx.globalAlpha,
					'floria.io',
					Length.u(0), Length.u(0),
					Length.u(50),
					'center',
					'white',
				);
			},
			styles.menu.invisible,
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.unitLength, 0, 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.unitLength, -200, 0.85),
					val: {},
				};	
			},
			'start',
			false,
			0,
		),
		arena: new Menu(
			Length.w(0), Length.h(0),
			{x: 'center', y: 'center'}	,
			Length.u(0), Length.u(0),
			util.nop(),
			styles.menu.invisible,
			function() {
				this.children.forEach(child => {
					child.open(true);
				});
			},
			function() {
				this.children.forEach(child => {
					child.close();
				});
			},
			'root',
			false,
			0,
		),
	}
}