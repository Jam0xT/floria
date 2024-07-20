import { play } from '../animation.js';
import * as util from '../utility.js';
import * as canvas from '../canvas.js';

let ctx;

function startRenderGame() {
	ctx = canvas.ctxMain;
	play(render);
}

function render() {
	util.fillBackground(ctx, '#1EA761');
}

export {
	startRenderGame,
}