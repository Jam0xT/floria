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
class Sended_Room {
	constructor(id_, players_, playerFaction_, owner_, type_, factionLim_) {
		this.id = id_;
		this.players = players_;
		this.playerFaction = playerFaction_;
		this.owner = owner_;
		this.type = type_;
		this.factionLim = factionLim_;
	}
}
class Room {
	constructor(mode, owner_) {
		this.id = getNewRoomID();
		this.players = {};
		this.playerFaction = {};
		this.playerNum = 0;
		this.playerRedNum = 0;
		this.playerBlueNum = 0;
		this.owner = owner_.id;
		if (!gamemodes[mode])
			throw new Error('trying to create room with unknown gamemode');
		this.game = new gamemodes[mode]();
		this.type = '1v1';
		this.factionLim = 1;
	}
	toSend() {
		return new Sended_Room(this.id, Object.keys(this.players), this.playerFaction, this.owner, this.type, this.factionLim);
	}
	update() {
		for (var player in this.players)
			this.players[player].emit(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, this.toSend());
	}
	add(socket) {
		roomOfPlayers[socket.id] = this;
		this.players[socket.id] = socket;
		this.playerNum++;
		if (this.playerBlueNum != this.factionLim) {
			this.playerBlueNum++;
			this.playerFaction[socket.id] = 'Blue';
		}
		else {
			this.playerRedNum++;
			this.playerFaction[socket.id] = 'Red';
		}
		console.log(`Player ${socket.id} joined Room #${this.id}`);
		this.update();
	}
	remove(socket) {
		this.playerNum--;
		if (this.playerFaction[socket.id] == 'Blue')
			this.playerBlueNum--;
		else
			this.playerRedNum--;
		delete this.playerFaction[socket.id];
		delete roomOfPlayers[socket.id];
		delete this.players[socket.id];
		if (this.playerNum == 0) {
			delete this;
			return;
		}
		else if (this.owner == socket) {
			for (var player in this.players) {
				this.owner = player;
				break;
			}
		}
		this.update();
	}
}
function checkOwner(socket) {
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, roomOfPlayers[socket.id].owner == socket.id);
}
function getRoomOfPlayer(socket) {
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, roomOfPlayers[socket.id]);
}
function createRoom(socket, mode) {
	let newRoom = new Room(mode, socket);
	rooms[mode][newRoom.id] = newRoom;
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CREATE, newRoom.id);
	console.log(`Player ${socket.id} created Room #${newRoom.id}.`);
	joinRoom(socket, mode, newRoom.id);
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
		else if (nowRoom.playerNum == nowRoom.factionLim * 2) {
			console.log(`Room #${roomId} is full`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.UNSUCCESSFUL_JOIN, -3);
		}
		else {
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, nowRoom.toSend());
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