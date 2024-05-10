import * as canvas from './canvas.js';
import { Length } from './canvas.js';

import * as util from '../utility.js';

import * as animation from './animation.js';

import { Button } from './button.js';

import { Menu } from './menu.js';

import styles from './styles.js';

let ctx;
const layers = canvas.layerSettings.startScreen;
const colors = styles.startScreen;
let transparency;
let buttons = {}, menus = {};

export {
	init,
	main,
}

function init() {
    transparency = {
        gen: util.gen.exponential_decrease(100, 0, 0.85),
        val: {},
    };
	initTutorial();
}

function main() {
    ctx = canvas.getCtx(layers.background);
    transparency.val = transparency.gen.next();
    if ( !transparency.val.done ) {
        ctx.globalAlpha = util.parseTransparency(transparency.val.value);
    }

    util.clear(ctx);
    util.fillBackground(ctx, colors.background);

	util.renderText(ctx, ctx.globalAlpha,
		'floria.io',
		Length.w(0.5), Length.h(0.3), Length.u(50));

	Object.values(buttons).forEach(button => {
		button.render(ctx);
	});

	Object.values(menus).forEach(menu => {
		menu.render(ctx);
	});

    animation.play(main);
}

function initTutorial() {
	buttons.tutorial = new Button(
		Length.w(1).sub(Length.u(20)), Length.h(1).sub(Length.u(20)),
		{x: 'center', y: 'center'},
		Length.u(10), Length.u(10),
		function(ctx_) {
			util.renderText(ctx_, ctx_.globalAlpha,
				'?',
				this.x, this.y.add(Length.u(7)),
				Length.u(20),
			);
		},
		styles.button.tutorial,
		util.nop(),
		util.nop(),
		0,
	),
	menus.tutorial = new Menu(
		Length.w(1).sub(Length.u(10)), Length.h(1).sub(Length.u(40)),
		{x: 'end', y: 'end'},
		Length.u(60), Length.u(40),
		function(ctx_) { // 渲染函数
			util.Tl(ctx, this.x.sub(this.rx).add(Length.u(5)), this.y.sub(this.ry).add(Length.u(13)));
			util.renderText(ctx_, ctx_.globalAlpha,
				'Tutorial',
				Length.u(0), Length.u(0),
				Length.u(10),
				'left',
				'yellow',
			);
			util.Tl(ctx, Length.u(0), Length.u(10));
			util.renderText(ctx_, ctx_.globalAlpha,
				'Is for nobs. hehe',
				Length.u(0), Length.u(0),
				Length.u(8),
				'left',
				'white',
			);
			util.Tf0(ctx);
		},
		styles.menu.black,
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
		100
	),
	buttons.tutorial.setOnHoverFn(menus.tutorial.onOpenFn.bind(menus.tutorial),
		menus.tutorial.onCloseFn.bind(menus.tutorial));
}