import { processGameUpdate } from './state.js';
import Constants from '../shared/constants.js';
import { getStorage } from './utility.js';
import client from './index.js';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';

const wsPort = Constants.WS_PORT;

const ws = new WebSocket(`${socketProtocol}://${window.location.hostname}:${wsPort}`);

const connect = new Promise(resolve => {
	ws.onopen = function () {
		sendWsMsg(Constants.MSG_TYPES.CLIENT.CONNECT, {
		});
		console.log("Connected to server");
		resolve();
	}
	
	ws.onmessage = onMessage;
	
	ws.onclose = onClose;
});

function sendWsMsg(type, data) {
	ws.send(JSON.stringify({
		type: type,
		data: data,
	}));
}

function onMessage(event) {
	const msg = JSON.parse(event.data);
	// console.log(msg);
	const {type, data} = msg;
	switch ( type ) {
		case Constants.MSG_TYPES.SERVER.CONNECT: {
			client.onConnect(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.JOIN: {
			client.onJoinRoom(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.LEAVE: {
			client.onLeaveRoom(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_JOIN: {
			client.onPlayerJoinRoom(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_LEAVE: {
			client.onPlayerLeaveRoom(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_READY: {
			client.onPlayerReady(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.UPDATE_SETTINGS: {
			client.onSettingsUpdate(data);
			break;
		}
		case Constants.MSG_TYPES.SERVER.GAME.START: {
			
			break;
		}
	}
}

function onClose(event) {
	console.log(event);
}

export {
	ws,
	connect,
	sendWsMsg,
}