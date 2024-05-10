import * as canvas from './render/canvas.js';

import * as animation from './render/animation.js';

import * as	startScreen from './render/startScreen/startScreen.js';

export default {
	init,
	loadStartScreen,
}

function init() {
	canvas.init();
}

function loadStartScreen() {
	animation.stop();
	startScreen.init();
	animation.play(startScreen.main);
}