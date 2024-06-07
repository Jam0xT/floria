const players = {};
const rooms = {};

export {
	add,
};

function add(socket) {
	players[socket.id] = socket;
}

class Room {
	constructor() {
		this.id = getNewRoomID();
	}

	add(socket) {

	}

	remove(socket) {

	}
}

const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fixedIdLen = 6;

function getNewRoomID() {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	let val = arr[0];
	let id = '';
	while ( val > 0 ) {
		id += charList[val % charList.length];
		val = (val - val % charList.length) / charList.length;
	}
	while ( id.length < fixedIdLen ) {
		id += '0';
	}
	return id;
}