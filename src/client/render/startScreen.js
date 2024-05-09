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
		((x, y) => {
			util.renderText(ctx, ctx.globalAlpha, '?', x, y.add(Length.u(7)), Length.u(20));
		}),
	),
	menus.tutorial = new Menu(
		Length.w(1).sub(Length.u(20)), Length.h(1).sub(Length.u(50)),
		{x: 'center', y: 'end'},
		Length.u(10), Length.u(10),
		((x, y) => {
			util.renderText(ctx, ctx.globalAlpha, '?', x, y.add(Length.u(7)), Length.u(20));
		}),
		styles.menu.black,
		function() {
			this.transparencyGen = {
				gen: util.gen.exponential_decrease(this.transparency, 0, 0.8),
				val: {},
			};
		},
		function() {
			this.transparencyGen = {
				gen: util.gen.logarithmic_increase(this.transparency, 100, 0.8),
				val: {},
			};	
		},
		100
	),
	buttons.tutorial.setOnHoverFn(menus.tutorial.onOpenFn.bind(menus.tutorial),
		menus.tutorial.onCloseFn.bind(menus.tutorial));
}