import { processGameUpdate } from './state.js';
import Constants from '../shared/constants.js';
import { getStorage } from './utility.js';
import client from './client.js';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';

const wsPort = Constants.WS_PORT;

export const ws = new WebSocket(`${socketProtocol}://${window.location.hostname}:${wsPort}`);

export const connectedPromise = new Promise(resolve => {
	ws.onopen = function () {
		const data = createData(Constants.MSG_TYPES.CLIENT.PLAYER.CONNECT, {
			self: {
				uuid: getStorage(`uuid`),
				username: client.username || ``,
			}
		})
		ws.send(data);
		console.log("Connected to server");
		resolve();
	}
	
	ws.onmessage = onMessage;
	
	ws.onclose = onClose;
});


/* value_client(暂定)
{
	self {
		uuid
		username
	}
	
	room {
		type
		isPrivate
		map
		id
		team {
			id
		}
	}
	
	player {
		uuid
	}
}

*/

export function createData(request, value) {
	const data = {
		request: request,
		value: value
	}
	return JSON.stringify(data);
}

function onMessage(event) {
	const parsedData = JSON.parse(event.data);
	console.log(parsedData);
	const {request, value} = parsedData;
	switch(request) {
		case Constants.MSG_TYPES.SERVER.CONNECT: {
			client.onConnect(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.JOIN: {
			client.onJoinRoom(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.LEAVE: {
			client.onLeaveRoom(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_JOIN: {
			client.onPlayerJoinRoom(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_LEAVE: {
			client.onPlayerLeaveRoom(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.PLAYER_READY: {
			client.onPlayerReady(value);
			break;
		}
		case Constants.MSG_TYPES.SERVER.ROOM.UPDATE_SETTINGS: {
			client.onSettingsUpdate(value);
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

/*
const connect = () => {
	connectedPromise.then(() => {
		socket.on(Constants.MSG_TYPES.SERVER.GAME.UPDATE, processGameUpdate);
	});
};
*/