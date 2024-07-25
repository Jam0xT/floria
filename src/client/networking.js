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
		socket.on(Constants.MSG_TYPES.SERVER.GAME.UPDATE, processGameUpdate);
		socket.on('disconnect', () => {
			console.log('Disconnected from server.');
			onGameOver();
		});
	});
};

export {
	socket,
	connectedPromise,
	connect,
}