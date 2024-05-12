import * as canvas from '../canvas.js';
import Length from '../length.js';

import * as util from '../../utility.js';

import * as animation from '../animation.js';

import styles from '../styles.js';

import getButtons from './buttons.js';
import getMenus from './menus.js';

let ctx;
let transparency;
const buttons = getButtons(), menus = getMenus();

export {
	init,
	load,
}

function init() {
    transparency = {
        gen: util.gen.exponential_decrease(100, 0, 0.93),
        val: {},
    };
	buttons.start_tutorial.setOnHoverFn(
		menus.start_tutorial.onOpenFn.bind(menus.start_tutorial),
		menus.start_tutorial.onCloseFn.bind(menus.start_tutorial)
	);
	buttons.start_arena.setOnTriggerFn(
		function() {
			unload('start');
			load('arena');
		}
	);
	buttons.arena_back.setOnTriggerFn(
		function() {
			unload('arena');
			load('start');
		}
	);
	Object.values(menus).filter(
		(menu) => (menu.parent != 'root')
	).forEach((menu) => {
		menus[menu.parent].append(menu);
	});

	Object.values(buttons).filter(
		(button) => (button.parent != 'root') // 尽管目前button不应该作为root
	).forEach((button) => {
		menus[button.parent].append(button);
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