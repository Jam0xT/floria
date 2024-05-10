import * as canvas from './canvas.js';
import Length from './length.js';

import * as util from '../utility.js';

import * as animation from './animation.js';

import styles from './styles.js';

import getButtons from './buttons.js';
import getMenus from './menus.js';

let ctx;
const colors = styles.startScreen;
let transparency;
let buttons = getButtons(), menus = getMenus();

export {
	init,
	main,
}

function init() {
    transparency = {
        gen: util.gen.exponential_decrease(100, 0, 0.93),
        val: {},
    };
	buttons.tutorial.setOnHoverFn(menus.tutorial.onOpenFn.bind(menus.tutorial),
		menus.tutorial.onCloseFn.bind(menus.tutorial));
	buttons.tutorial.onOpenFn();
}

function main() {
    ctx = canvas.getTmpCtx();
    transparency.val = transparency.gen.next();
    if ( !transparency.val.done ) {
        ctx.globalAlpha = util.parseTransparency(transparency.val.value);
    }

    util.clear(ctx);
    util.fillBackground(ctx, colors.background);

	util.renderText(ctx, ctx.globalAlpha,
		'floria.io',
		Length.w(0.5), Length.h(0.3), Length.u(50)
	);

	Object.values(buttons).forEach(button => {
		button.render(ctx);
	});

	Object.values(menus).forEach(menu => {
		menu.render(ctx);
	});

	canvas.draw(ctx);
    animation.play(main);
}