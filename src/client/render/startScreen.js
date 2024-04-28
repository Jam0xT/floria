import * as canvas from './canvas.js';
import * as util from './utility.js';
import * as animation from './animation.js';
import style from './style.js';

let ctx;
const layers = canvas.layerSettings.startScreen;
const colors = style.startScreen;
let opacity;
// const W = canvas.W, H = canvas.H, h = canvas.hUnit;
export function init() {
    opacity = {
        gen: util.gen.linear_increase(0, 100, 4),
        val: 0,
    }
}

export function main() {
    ctx = canvas.getCtx(layers.background);
    opacity.val = opacity.gen.next();
    if ( !opacity.val.done ) {
        ctx.globalAlpha = opacity.val.value * 0.01;
    }
    util.clear(ctx);
    util.fillBackground(ctx, colors.background);
    animation.play(main);
}