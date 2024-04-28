import * as canvas from './render/canvas.js';
import * as animation from './render/animation.js';
import * as	startScreen from './render/startScreen.js';
export function init() {
	canvas.init();
}

export function loadStartScreen() {
	animation.play(startScreen.main);
}