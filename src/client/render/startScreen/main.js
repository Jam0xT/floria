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

let last = Date.now(), fpsList = [];

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

	// renderFps();

	canvas.draw(ctx);
    animation.play(main);
}

function renderFps() {
	let now = Date.now();
	let timeElapsed = now - last;
	last = now;
	let fps = (1000 / timeElapsed).toFixed(1);
	util.renderText(ctx, ctx.globalAlpha,
		`fps:${fps}`,
		Length.u(50), Length.u(20),
		Length.u(20),
		'left',
		'red',
	);
	fpsList.push(fps);
	if ( fpsList.length > 200 )
		fpsList.shift();
	console.log(fpsList);
	for (let i = 0; i < fpsList.length; i ++ ) {
		util.renderRoundRect(ctx,
			Length.u(i * 5), Length.u(30),
			Length.u(5), Length.u(fpsList[i]),
			[Length.u(0)],
		);
		ctx.fillStyle = `rgb(255, ${50 * Math.abs(fpsList[i] - 60)}, 255)`;
		ctx.fill();
	}
}