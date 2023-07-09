import { sendMovement, sendMouseDownEvent, sendMouseUpEvent } from './networking';

var keyDown = {
	'w': false,
	's': false,
	'a': false,
	'd': false,
};

var currentDirection;

document.addEventListener('contextmenu', event => event.preventDefault()); // prevent right-clicks

function onMouseMove(e) {
	handleMovement(e.clientX, e.clientY);
}

function onMouseDown(e) {
	sendMouseDownEvent(e.buttons);
}

function onMouseUp(e) {
	sendMouseUpEvent(e.buttons);
}

// function onTouchInput(e) {
// 	const touch = e.touches[0];
// 	handleMovement(touch.clientx, touch.clientY)
// }

function handleMovement(x, y) {
	const direction = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
	const dx = x - window.innerWidth / 2;
	const dy = y - window.innerHeight / 2;
	const distanceMouseCenter = Math.sqrt(dx * dx + dy * dy);
	const speedRatio = Math.min(100, distanceMouseCenter) / 100;
	const input = {
		direction: direction,
		magnitude: speedRatio,
	}
	sendMovement(input);
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
			sendMovement({
				direction: currentDirection,
				magnitude: 0,
			});
		} else {
			currentDirection = Math.atan2(directionX, directionY);
			sendMovement({
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
			sendMovement({
				direction: currentDirection,
				magnitude: 0,
			});
		} else {
			currentDirection = Math.atan2(directionX, directionY);
			sendMovement({
				direction: currentDirection,
				magnitude: 1,
			});
		}
	}
}

export function startCapturingInput(isKeyboardInput) {
	if ( !isKeyboardInput ) {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		// window.addEventListener('touchstart', onTouchInput);
		// window.addEventListener('touchmove', onTouchInput);
	} else {
		window.onkeydown = handleKeyDownInput;
		window.onkeyup = handleKeyUpInput;
	}
}

export function stopCapturingInput(isKeyboardInput) {
	if ( !isKeyboardInput ) {
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('click', onClick);
		// window.removeEventListener('touchstart', onTouchInput);
		// window.removeEventListener('touchmove', onTouchInput);
	}
}