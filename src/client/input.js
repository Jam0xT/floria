import * as nw from './networking.js';
import Constants from '../shared/constants.js';

function onMouseMove(e) {
	const dpr = window.devicePixelRatio;
	const x = e.clientX, y = e.clientY;
	const w = window.innerWidth, h = window.innerHeight;
	const dir = Math.atan2(y - h / 2, x - w / 2);
	const dx = x - w / 2, dy = y - h / 2;
	const d = Math.sqrt(dx * dx + dy * dy); // 鼠标到屏幕中心的距离
	const maxd = 100; // power 为 100 时的距离
	const power = Math.min(maxd, d) / maxd; // [0, 1] 范围内的值，为玩家速度乘数
	const input = {
		dir: dir,
		power: power,
	};
	// type 0
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.GAME.INPUT, 0, input);
}

function onMouseDown(e) {
	const dpr = window.devicePixelRatio;
	const x = e.clientX * dpr, y = e.clientY * dpr;
	// render.broadcast('mouse_down', x, y, parseButtons(e.buttons));
}

function onMouseUp(e) {
	const dpr = window.devicePixelRatio;
	const x = e.clientX * dpr, y = e.clientY * dpr;
	// render.broadcast('mouse_up', x, y, parseButtons(~e.buttons));
}

function onKeyDown(e) {
	// render.broadcast('key_down', e);
}

function onKeyUp() {

}

function parseButtons(buttons) { // 将 buttons 信息转化成 Object
	return {
		left: buttons & 1,
		right: buttons & 2,
	};
}

function startCapturingInput() {
	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mouseup', onMouseUp);
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);
}

export {
	startCapturingInput,
}