import io from 'socket.io-client';
import { processGameUpdate } from './state.js';

import Constants from '../shared/constants.js';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';

const socket = io(
	`${socketProtocol}://${window.location.host}`,
	{reconnection: false}
);

const connectedPromise = new Promise(resolve => {
	socket.on('connect', () => {
		console.log('Connected to server!');
		resolve();
	});
});

const connect = (onGameOver) => {
	connectedPromise.then(() => {
		// socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, joinRoom);
		socket.on(Constants.MSG_TYPES.SERVER.GAME.UPDATE, processGameUpdate);
		// socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
		socket.on('disconnect', () => {
			console.log('Disconnected from server.');
			onGameOver();
		});
	});
};

function onGameOver() {
	// 临时
}

const play = username => {
	socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

const sendMovement = (movement) => {
	socket.emit(Constants.MSG_TYPES.MOVEMENT, movement);
};

const sendMouseDownEvent = (mouseDownEvent) => {
	socket.emit(Constants.MSG_TYPES.MOUSE_DOWN, mouseDownEvent);
}

const sendMouseUpEvent = (mouseUpEvent) => {
	socket.emit(Constants.MSG_TYPES.MOUSE_UP, mouseUpEvent);
}

const sendPetalSwitchEvent = (petalA, petalB) => {
	socket.emit(Constants.MSG_TYPES.PETAL_SWITCH, petalA, petalB);
}

const sendCmdInv = (sel, petal) => {
	socket.emit(Constants.MSG_TYPES.CMD_INV, sel, petal);
}

export {
	socket,
	connectedPromise,
	connect,
}