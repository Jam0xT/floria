import * as canvas from '../canvas.js';
import Length from '../length.js';

import * as util from '../../utility.js';

import * as animation from '../animation.js';

import styles from '../styles.js';

import getMenus from'./menus.js';

let ctx;
let transparency;

let menus = getMenus();

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

	Object.values(menus).filter(
		(menu) => (menu.parent != 'root')
	).forEach((menu) => {
		menus[menu.parent].append(menu);
		menu.parentMenu = menus[menu.parent];
	});
}

function load(screen) {
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
}

function renderFps() {
	let now = Date.now();
	let timeElapsed = now - last;
	last = now;
	let fps = (1000 / timeElapsed).toFixed(1);
	util.renderText(ctx, ctx.globalAlpha,
		`fps:${fps}`,
		Length.w(1).sub(Length.u(50)), Length.u(10),
		Length.u(10),
		'left',
		'yellow',
	);
	fpsList.push(fps);
	if ( fpsList.length > 200 )
		fpsList.shift();
	for (let i = 0; i < fpsList.length; i ++ ) {
		util.renderRoundRect(ctx,
			Length.u(i * 2), Length.u(10),
			Length.u(2), Length.u(fpsList[i] / 2),
			[Length.u(0)],
		);
		ctx.fillStyle = `rgb(255, ${50 * Math.abs(fpsList[i] - 60)}, 255)`;
		ctx.fill();
	}
}