import Constants from '../shared/constants.js';

const rooms = {};

export {
	createRoom,
	joinRoom
};

class Room {
	constructor() {
		this.id = getNewRoomID();
		this.players = {};
		this.game = 'uwu';
	}

	add(socket) {
		this.players[socket.id] = socket;
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, this.id);
		console.log(`Player ${socket.id} joined Room ${this.id}`);
	}

	remove(socket) {
		delete this.players[socket.id];
	}
}

function createRoom(socket) {
	let newRoom = new Room();
	rooms[newRoom.id] = newRoom;
	newRoom.add(socket);
	console.log(`Player ${socket.id} created Room ${newRoom.id}.`);
}

function joinRoom(socket, roomId) {
	console.log(`Player ${socket.id} tries to join Room ${roomId}:`);
	if ( !rooms[roomId] ) {
		console.log(`Room ${roomId} not found.`);
	} else {
		rooms[roomId].add(socket);
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