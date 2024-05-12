import * as canvas from './render/canvas.js';

import * as startScreen from './render/startScreen/main.js';

export default {
	init,
	loadStartScreen,
}

function init() {
	canvas.init();
}

function loadStartScreen() {
	startScreen.init();
	startScreen.load('start');
}