import * as canvas from '../canvas.js';
import Length from '../length.js';

import * as util from '../../utility.js';

import * as animation from '../animation.js';

import styles from '../styles.js';

import getMenus from './menus.js';

let ctx;
let transparency;
const menus = getMenus();

export {
	init,
	load,
	menus,
}

function init() {
    transparency = {
        gen: util.gen.exponential_decrease(100, 0, 0.93),
        val: {},
    };
	menus.start_tutorial_button.setOnHoverFn(
		menus.start_tutorial.onOpenFn.bind(menus.start_tutorial),
		menus.start_tutorial.onCloseFn.bind(menus.start_tutorial)
	);
	menus.start_arena_button.setOnTriggerFn(
		function() {
			unload('start');
			load('arena');
		}
	);
	menus.arena_back_button.setOnTriggerFn(
		function() {
			unload('arena');
			load('start');
		}
	);

	Object.values(menus).filter(
		(menu) => (menu.parent != 'root')
	).forEach((menu) => {
		menus[menu.parent].append(menu);
		menu.parentMenu = menus[menu.parent];
	});
}

function load(screen) {
	animation.stop();
	menus[screen].open();
	animation.play(main);
}

function unload(screen) {
	menus[screen].close();
}

function main() {
	util.clear(canvas.ctxMain);

    ctx = canvas.getTmpCtx();
    transparency.val = transparency.gen.next();
    if ( !transparency.val.done ) {
        ctx.globalAlpha = util.parseTransparency(transparency.val.value);
    }

    util.fillBackground(ctx, styles.background.screen);

	Object.values(menus).filter(
		(menu) => (menu.parent == 'root')
	).forEach((menu) => {
		menu.render(ctx);
	});

	canvas.draw(ctx);
    animation.play(main);
}