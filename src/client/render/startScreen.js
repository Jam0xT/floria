import * as canvas from './canvas.js';
import * as util from './utility.js';
import * as animation from './animation.js';
import style from './style.js';

let ctx;
const layers = canvas.layerSettings.startScreen;
const colors = style.startScreen;

export function main() {
    ctx = canvas.getCtx(layers.background);
    util.fillBackground(ctx, colors.background);
    animation.play(main);
}