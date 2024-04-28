import * as canvas from './canvas.js';
import * as util from './utility.js';
import * as animation from './animation.js';
import style from './style.js';

let ctx;
const layers = canvas.layerSettings.startScreen;
const colors = style.startScreen;
const W = canvas.W, H = canvas.H, h = canvas.hUnit;

export function main() {
    ctx = canvas.getCtx(layers.background);
    util.clear(ctx);
    util.fillBackground(ctx, colors.background);
    animation.play(main);
}