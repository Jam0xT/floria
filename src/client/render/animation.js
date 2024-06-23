import { framePerSecond as fps } from '../render.js';

let now, then, elapsed;
let fpsInterval;
let renderFn;
let playing = false;

function play(renderFunction) {
	renderFn = renderFunction;
	if ( !playing ) {
		playing = true;
		then = Date.now();
		fpsInterval = 1000 / fps;
		animate(renderFn);
	}
}

function animate() {
	requestAnimationFrame(animate);

	now = Date.now();
	elapsed = now - then;

	if ( elapsed > fpsInterval ) {
		then = now - ( elapsed % fpsInterval );

		renderFn();
	}
}

export {
	play,
}