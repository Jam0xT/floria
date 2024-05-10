let animationFrameRequestId;

export {
	stop,
	play,
}

function stop() {
    cancelAnimationFrame(animationFrameRequestId);
}

function play(renderFunction) {
    animationFrameRequestId = requestAnimationFrame(renderFunction);
}