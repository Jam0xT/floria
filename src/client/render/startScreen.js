import * as canvas from './canvas.js';
import * as util from './utility.js';
import * as animation from './animation.js';

let ctx;
const layers = canvas.layerSettings.startScreen;

export function main() {
    ctx = canvas.getCtx(layers.background);
    animation.play(main);
}