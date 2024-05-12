import Length from '../length.js';

import styles from '../styles.js';

import Menu from '../menu.js';

import * as util from '../../utility.js';

export default function getMenus() {
	return {
		start: new Menu(
			Length.w(0), Length.h(0),
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
			false,
			0,
		),
		start_tutorial: new Menu(
			Length.u(-50), Length.u(-60),
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
			'start_tutorial_button',
			true,
			false,
			100,
		),
		start_title: new Menu(
			Length.w(0.5), Length.h(0).sub(Length.u(50)),
			Length.u(0), Length.u(0),
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
					gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0.3).parse(), 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
					val: {},
				};	
			},
			'start',
			false,
			false,
			0,
		),
		start_tutorial_button: new Menu(
			Length.w(1).sub(Length.u(20)), Length.h(1).add(Length.u(20)),
			Length.u(10), Length.u(10),
			function(ctx) {
				util.renderText(ctx, ctx.globalAlpha,
					'?',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.parse(), Length.h(1).sub(Length.u(20)).parse(), 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(1).add(Length.u(20)).parse(), 0.85),
					val: {},
				};	
			},
			'start',
			false,
			true,
			0,
		),
		start_arena_button: new Menu(
			Length.w(0.5), Length.h(0).sub(Length.u(50)),
			Length.u(75), Length.u(15),
			function(ctx_) {
				util.renderText(ctx_, ctx_.globalAlpha,
					'Arena',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0.4).parse(), 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
					val: {},
				};
			},
			'start',
			false,
			true,
			0,
		),
		arena: new Menu(
			Length.w(0), Length.h(0),
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
			false,
			0,
		),
		arena_room: new Menu(
			Length.w(1).add(Length.u(100)), Length.h(0.3),
			Length.u(0), Length.u(0),
			function(ctx) {
				util.renderText(ctx, ctx.globalAlpha,
					'Room',
					Length.u(0), Length.u(0),
					Length.u(30),
					'center',
					'white',
				);
			},
			styles.menu.invisible,
			function() {
				this.xGen = {
					gen: util.gen.exponential_decrease(this.x.parse(), Length.w(0.7).parse(), 0.85),
					val: {},
				};	
			},
			function() {
				this.xGen = {
					gen: util.gen.logarithmic_increase(this.x.parse(), Length.w(1).add(Length.u(100)).parse(), 0.85),
					val: {},
				};
			},
			'arena',
			false,
			false,
			0,
		),
		arena_back_button: new Menu(
			Length.w(0).add(Length.u(20)), Length.h(1).add(Length.u(20)),
			Length.u(10), Length.u(10),
			function(ctx_) {
				util.renderText(ctx_, ctx_.globalAlpha,
					'<',
					this.rx, this.ry.add(Length.u(6)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.parse(), Length.h(1).sub(Length.u(20)).parse(), 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(1).add(Length.u(20)).parse(), 0.85),
					val: {},
				};	
			},
			'arena',
			false,
			true,
			0,
		),
		arena_room_create_button: new Menu(
			Length.u(0), Length.u(25),
			Length.u(40), Length.u(10),
			function(ctx) {
				util.renderText(ctx, ctx.globalAlpha,
					'Create',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
			},
			function() {
			},
			'arena_room',
			false,
			true,
			0,
		),
		arena_room_join_button: new Menu(
			Length.u(0), Length.u(55),
			Length.u(40), Length.u(10),
			function(ctx) {
				util.renderText(ctx, ctx.globalAlpha,
					'Join',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
			},
			function() {
			},
			'arena_room',
			false,
			true,
			0,
		),
		arena_title: new Menu(
			Length.u(45), Length.h(0).sub(Length.u(50)),
			Length.u(0), Length.u(0),
			function(ctx) {
				ctx.save();

				util.blendAlpha(ctx, 0.7);

				util.renderText(ctx, ctx.globalAlpha,
					'floria.io',
					Length.u(0), Length.u(0),
					Length.u(20),
					'center',
					'white',
				);
				
				ctx.restore();
			},
			styles.menu.invisible,
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.parse(), Length.u(25).parse(), 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
					val: {},
				};	
			},
			'arena',
			false,
			false,
			0,
		),
	}
}