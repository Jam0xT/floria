let animationFrameRequestId;

export function stop() {
    cancelAnimationFrame(animationFrameRequestId);
}

export function play(renderFunction) {
    animationFrameRequestId = requestAnimationFrame(renderFunction);
}