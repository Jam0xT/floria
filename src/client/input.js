import { sendInput } from './networking';

var keyDown = {
	'w': false,
	's': false,
	'a': false,
	'd': false,
};

var currentDirection;

function onMouseInput(e) {
	handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
	const touch = e.touches[0];
	handleInput(touch.clientx, touch.clientY)
}

function handleInput(x, y) {
	const direction = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
	const dx = x - window.innerWidth / 2;
	const dy = y - window.innerHeight / 2;
	const distanceMouseCenter = Math.sqrt(dx * dx + dy * dy);
	const speedRatio = Math.min(100, distanceMouseCenter) / 100;
	const input = {
		direction: direction,
		magnitude: speedRatio,
	}
	sendInput(input);
}

function handleKeyDownInput(e) {
	if ( e.key == 'w' || e.key == 's' || e.key == 'a' || e.key == 'd' ) {
		keyDown[e.key] = true;

		var directionX = 0;
		var directionY = 0;
	
		if ( keyDown['w'] )
			directionY ++;
		if ( keyDown['s'] )
			directionY --;
		if ( keyDown['a'] )
			directionX --;
		if ( keyDown['d'] )
			directionX ++;
		
		if ( directionX == 0 && directionY == 0 ) {
			sendInput({
				direction: currentDirection,
				magnitude: 0,
			});
		} else {
			currentDirection = Math.atan2(directionX, directionY);
			sendInput({
				direction: currentDirection,
				magnitude: 1,
			});
		}
	}
}

function handleKeyUpInput(e) {
	if ( e.key == 'w' || e.key == 's' || e.key == 'a' || e.key == 'd' ) {
		keyDown[e.key] = false;

		var directionX = 0;
		var directionY = 0;
	
		if ( keyDown['w'] )
			directionY ++;
		if ( keyDown['s'] )
			directionY --;
		if ( keyDown['a'] )
			directionX --;
		if ( keyDown['d'] )
			directionX ++;

		if ( directionX == 0 && directionY == 0 ) {
			sendInput({
				direction: currentDirection,
				magnitude: 0,
			});
		} else {
			currentDirection = Math.atan2(directionX, directionY);
			sendInput({
				direction: currentDirection,
				magnitude: 1,
			});
		}
	}
}

export function startCapturingInput(isKeyboardInput) {
	if ( !isKeyboardInput ) {
		window.addEventListener('mousemove', onMouseInput);
		window.addEventListener('click', onMouseInput);
		window.addEventListener('touchstart', onTouchInput);
		window.addEventListener('touchmove', onTouchInput);
	} else {
		window.onkeydown = handleKeyDownInput;
		window.onkeyup = handleKeyUpInput;
	}
}

export function stopCapturingInput(isKeyboardInput) {
	if ( !isKeyboardInput ) {
		window.removeEventListener('mousemove', onMouseInput);
		window.removeEventListener('click', onMouseInput);
		window.removeEventListener('touchstart', onTouchInput);
		window.removeEventListener('touchmove', onTouchInput);
	}
}