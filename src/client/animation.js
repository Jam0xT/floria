const fps = 60;
let now, then, elapsed;
let fpsInterval;
let renderFn;
let playing = false;

function play(renderFunction, fixed = false) {
	renderFn = renderFunction;
	if ( !playing ) {
		playing = true;
		then = Date.now();
		fpsInterval = 1000 / fps;
		if ( fixed )
			animateFixed(renderFn);
		else
			animate(renderFn);
	}
}

function animate() {
	requestAnimationFrame(animate);
	renderFn();
}

function animateFixed() {
	requestAnimationFrame(animateFixed);

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