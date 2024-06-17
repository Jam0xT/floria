import Constants from '../shared/constants.js';

import gamemodes from './gamemodes/gamemodes.js';

const rooms = {
	arena: {},
};

export {
	createRoom,
	joinRoom,
	getRoomOfPlayer,
	checkOwner,
};
var roomOfPlayers = {};
class Room {
	constructor(mode, owner_) {
		this.id = getNewRoomID();
		this.players = {};
		this.owner = owner_;
		if (!gamemodes[mode])
			throw new Error('trying to create room with unknown gamemode');
		this.game = new gamemodes[mode]();
	}

	add(socket) {
		roomOfPlayers[socket.id] = this;
		this.players[socket.id] = socket;
		console.log(`Player ${socket.id} joined Room #${this.id}`);
	}
	remove(socket) {
		roomOfPlayers[socket.id] = null;
		delete this.players[socket.id];
		if (this.players.length == 0)
			delete this;
		else if (this.owner == socket) {
			for (player in players) {
				this.owner = player;
				break;
			}
		}
	}
}
function checkOwner(socket) {
	return roomOfPlayers[socket.id].owner == socket;
}
function getRoomOfPlayer(socket) {
	return roomOfPlayers[socket.id];
}
function createRoom(socket, mode) {
	let newRoom = new Room(mode, socket);
	rooms[mode][newRoom.id] = newRoom;
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CREATE,newRoom.id);
	console.log(`Player ${socket.id} created Room #${newRoom.id}.`);
}

function joinRoom(socket, mode, roomId) {
	console.log(`Player ${socket.id} tries to join Room #${roomId}:`);
	if (!rooms[mode][roomId]) {
		console.log(`Room #${roomId} not found.`);
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.UNSUCCESSFUL_JOIN, -1);
	}
	else {
		var nowRoom = rooms[mode][roomId];
		if (nowRoom.players[socket.id]) {
			console.log(`Player ${socket.id} is already in the Room`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.UNSUCCESSFUL_JOIN, -2);
		}
		else if (Object.keys(nowRoom.players).length == 4) {
			console.log(`Room #${roomId} is full`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.UNSUCCESSFUL_JOIN, -3);
		}
		else {
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN);
			rooms[mode][roomId].add(socket);
		}
	}
}

const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fixedIdLen = 6;

function getNewRoomID() {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	let val = arr[0];
	let id = '';
	while (val > 0) {
		id += charList[val % charList.length];
		val = (val - val % charList.length) / charList.length;
	}
	while (id.length < fixedIdLen) {
		id += '0';
	}
	return id;
}