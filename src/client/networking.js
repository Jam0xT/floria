import { WebSocket } from 'ws';
import { processGameUpdate } from './state.js';

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';

export const ws = new WebSocket(`${socketProtocol}://${window.location.host}`)

export const connectedPromise = new Promise(resolve => {
	ws.onopen = function () {
		console.log("Connected to server")
		resolve()
	}
	
	ws.onmessage = onMessage
	
	ws.onclose = onClose
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
	console.log(parsedData)
}

function onClose(event) {
	console.log(event)
}

/*
const connect = () => {
	connectedPromise.then(() => {
		socket.on(Constants.MSG_TYPES.SERVER.GAME.UPDATE, processGameUpdate);
	});
};
*/