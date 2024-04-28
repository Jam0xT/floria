import * as canvas from './canvas.js';
import * as util from './utility.js';
import * as animation from './animation.js';
import style from './style.js';

let ctx;
const layers = canvas.layerSettings.startScreen;
const colors = style.startScreen;
let transparency;
// const W = canvas.W, H = canvas.H, h = canvas.hUnit;
export function init() {
    transparency = {
        gen: util.gen.exponential_decrease(100, 0, 0.8),
        val: 0,
    }
}

export function main() {
    ctx = canvas.getCtx(layers.background);
    transparency.val = transparency.gen.next();
    if ( !transparency.val.done ) {
        ctx.globalAlpha = 1 - transparency.val.value * 0.01;
    }
    util.clear(ctx);
    util.fillBackground(ctx, colors.background);
    animation.play(main);
}