import io from 'socket.io-client';
import { processGameUpdate } from './state';

const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(
	`${socketProtocol}://${window.location.host}`,
	{reconnection: false}
)
const connectedPromise = new Promise(resolve => {
	socket.on('connect', () => {
		console.log('Connected to server!');
		resolve();
	});
});

export const connect = onGameOver => {
	connectedPromise.then(() => {
		socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
		socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
		socket.on('disconnect', () => {
			console.log('Disconnected from server.');
			onGameOver();
		});
	});
};

export const play = username => {
	socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

export const sendMovement = (movement) => {
	socket.emit(Constants.MSG_TYPES.MOVEMENT, movement);
};

export const sendMouseDownEvent = (mouseDownEvent) => {
	socket.emit(Constants.MSG_TYPES.MOUSE_DOWN, mouseDownEvent);
}

export const sendMouseUpEvent = (mouseUpEvent) => {
	socket.emit(Constants.MSG_TYPES.MOUSE_UP, mouseUpEvent);
}

export const sendPetalSwitchEvent = (petalA, petalB) => {
	socket.emit(Constants.MSG_TYPES.PETAL_SWITCH, petalA, petalB);
}

export const sendCmdInv = (sel, petal) => {
	socket.emit(Constants.MSG_TYPES.CMD_INV, sel, petal);
}