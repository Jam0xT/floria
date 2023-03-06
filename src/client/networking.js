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
			window.location.reload();
		});
	})
};

export const play = username => {
	socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

export const sendInput = (input) => {
	socket.emit(Constants.MSG_TYPES.INPUT, input);
};