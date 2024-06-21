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
	rooms,
	roomOfPlayers,
	quitRoom,
};
var roomOfPlayers = {};
class Sended_Room {
	constructor(id_, players_, owner_, type_, factionLim_, mode_,) {
		this.id = id_;
		this.players = players_;
		this.owner = owner_;
		this.type = type_;
		this.factionLim = factionLim_;
		this.mode = mode_;
	}
}
class Player_In_Room_Status {
	constructor(id, nickName, faction, isReady) {
		this.id = id;
		this.nickName = nickName;
		this.faction = faction;
		this.isReady = isReady;
	}
}
class Room {
	constructor(mode, owner_) {
		this.id = getNewRoomID();
		this.players = {};
		this.playerStatus = {};
		this.playerNum = 0;
		this.playerRedNum = 0;
		this.playerBlueNum = 0;
		this.owner = owner_.id;
		if (!gamemodes[mode])
			throw new Error('trying to create room with unknown gamemode');
		this.mode = mode;
		this.game = new gamemodes[mode]();
		this.type = '1v1';
		this.factionLim = 1;
	}
	toSend() {
		return new Sended_Room(this.id, this.playerStatus, this.owner, this.type, this.factionLim, this.mode);
	}
	update() {
		for (let player in this.players)
			this.players[player].emit(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, this.toSend());
	}
	add(socket) {
		roomOfPlayers[socket.id] = this;
		this.players[socket.id] = socket;
		this.playerNum++;
		let faction;
		if (this.playerBlueNum != this.factionLim) {
			this.playerBlueNum++;
			faction = 'Blue';
		}
		else {
			this.playerRedNum++;
			faction = 'Red';
		}
		this.playerStatus[socket.id] = new Player_In_Room_Status(socket.id, socket.id, faction, false);
		console.log(`Player ${socket.id} joined Room #${this.id}`);
		this.update();
	}
	remove(socket) {
		this.playerNum--;
		if (this.playerStatus[socket.id].faction == 'Blue')
			this.playerBlueNum--;
		else
			this.playerRedNum--;
		delete this.playerStatus[socket.id];
		delete roomOfPlayers[socket.id];
		delete this.players[socket.id];
		console.log(`Player ${socket.id} left Room #${this.id}`)
		if (this.playerNum == 0) {
			console.log(`Room #${this.id} Deleted`);
			delete rooms[this.mode][this.id];
			return;
		}
		else if (this.owner == socket.id) {
			for (let player in this.players) {
				this.owner = player;
				break;
			}
		}
		this.update();
	}
	checkAllReady() {
		let cnt = 0;
		for(let player in this.playerStatus)
			if(this.playerStatus[player].isReady)
				cnt++;
		if(cnt==this.factionLim*2)
			return true;
		return false;
	}
	joinGame() {
		this.game.run();
		for(let player in this.players)
		{
			this.players[player].emit(Constants.MSG_TYPES.SERVER.GAME.START);
			delete roomOfPlayers[player];
			this.players[player].emit(Constants.MSG_TYPES.SERVER.ROOM.QUIT);
		}
		delete rooms[this.mode][this.id];
	}
	readyChange(socket) {
		if (!this.playerStatus[socket.id])
			throw new Error('trying to change the ready status of a unjoined player');
		this.playerStatus[socket.id].isReady = !this.playerStatus[socket.id].isReady;
		this.update();
		if(this.checkAllReady)
			this.joinGame();
	}
}
function checkOwner(socket) {
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, roomOfPlayers[socket.id].owner == socket.id);
}
function getRoomOfPlayer(socket) {
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, roomOfPlayers[socket.id]);
}
function createRoom(socket, mode) {
	if(roomOfPlayers[socket.id])
	{
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'You are already in a room,quit first.','red');
		return ;
	}
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
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'This Room does not exist','red');
	}
	else {
		let nowRoom = rooms[mode][roomId];
		if (nowRoom.players[socket.id]) {
			console.log(`Player ${socket.id} is already in the Room`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'You are already in this room','red');
		}
		else if (nowRoom.playerNum == nowRoom.factionLim * 2) {
			console.log(`Room #${roomId} is full`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'This room is already full','red');
		}
		else {
			console.log(`Player ${socket.id} successfully joined the Room #${roomId}`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, nowRoom.toSend());
			rooms[mode][roomId].add(socket);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'Successfully joined the room','green');
		}
	}
}
function quitRoom(socket, needMsg) {
	if (!roomOfPlayers[socket.id])
		return;
	roomOfPlayers[socket.id].remove(socket);
	delete roomOfPlayers[socket.id];
	if (needMsg)
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'Successfully quited the room','green');
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.QUIT);
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