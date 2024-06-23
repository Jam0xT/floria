import * as render from './render.js';

function onMouseMove(e) {
	const dpr = getDpr();
	const x = e.clientX * dpr, y = e.clientY * dpr;
	render.broadcast('mouse_move', x, y);
}

function onMouseDown(e) {
	const dpr = getDpr();
	const x = e.clientX * dpr, y = e.clientY * dpr;
	render.broadcast('mouse_down', x, y, parseButtons(e.buttons));

}

function onMouseUp(e) {
	const dpr = getDpr();
	const x = e.clientX * dpr, y = e.clientY * dpr;
	render.broadcast('mouse_up', x, y, parseButtons(~e.buttons));
}

function onKeyDown(e) {
	render.broadcast('key_down', e);
}

function onKeyUp() {

}

function parseButtons(buttons) { // 将 buttons 信息转化成 Object
	return {
		left: buttons & 1,
		right: buttons & 2,
	};
}

function getDpr() {
	return window.devicePixelRatio;
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