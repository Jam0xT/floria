import Constants from '../shared/constants.js';

import gamemodes from './gamemodes/gamemodes.js';

const rooms = {
};

const roomIDOfPlayer = {};

class Room {
	constructor(mode, ownerID_) {
		this.id = getNewRoomID();
		this.sockets = {}; // (socket)id: socket
		this.players = {}; // (socket)id: {status, username, socketid}
		this.playerCount = 0; // 维护玩家数量
		this.ownerID = ownerID_; // 房主ID
		// if (!gamemodes[mode])
		// 	throw new Error('trying to create room with unknown gamemode');
		this.mode = mode;
		this.game = undefined;
		this.teamCount = 2; // 队伍数量
		this.teamSize = 1; // 队伍大小
		this.teams = []; // 队伍 {color, playerCount}
		this.settings = {}; // 其他设置
	}

	sendInfo(socket) {
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.INFO, {
			players: this.players,
			owner: this.ownerID,
			teamCount: this.teamCount,
			teamSize: this.teamSize,
			settings: this.settings,
		});
	}

	update(type, update, cancel = '') {
		Object.keys(this.sockets).forEach(socketID => {
			if ( socketID == cancel )
				return ;
			const socket = this.sockets[socketID];
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, type, update);
		});
		// addPlayer: 0, {player}
		// removePlayer: 1, {socketid}
	}

	addPlayer(socket, username) {
		roomIDOfPlayer[socket.id] = this.id;
		this.sockets[socket.id] = socket;
		this.players[socket.id] = {
			'team': -1,
			'isOwner': (socket.id == this.ownerID),
			'username': username,
			'socketid': socket.id,
		};
		this.playerCount += 1;
		this.sendInfo(socket);
		this.update(0, {player: this.players[socket.id]}, socket.id);
	}

	removePlayer(socketID) {
		this.update(1, {player: this.players[socketID]});
		delete roomIDOfPlayer[socketID];
		delete this.sockets[socketID];
		delete this.players[socketID];
		this.playerCount -= 1;
		if ( this.playerCount == 0 ) {
			delete rooms[this.id];
			console.log(`Room #${this.id} has been deleted.`);
			return ;
		}
	}

	// checkAllReady() {
	// 	let cnt = 0;
	// 	for (let player in this.playerStatus)
	// 		if (this.playerStatus[player].isReady)
	// 			cnt++;
	// 	if (cnt == this.factionLim * 2)
	// 		return true;
	// 	return false;
	// }

	// joinGame() {
	// 	this.game = new gamemodes[this.mode]();
	// 	this.game.start();
	// 	for (let player in this.players) {
	// 		this.players[player].emit(Constants.MSG_TYPES.SERVER.GAME.START);
	// 		delete roomIDOfPlayer[player];
	// 		this.players[player].emit(Constants.MSG_TYPES.SERVER.ROOM.QUIT);
	// 	}
	// 	delete rooms[this.mode][this.id];
	// }

	// readyChange(socket) {
	// 	if (!this.playerStatus[socket.id])
	// 		throw new Error('trying to change the ready status of a unjoined player');
	// 	this.playerStatus[socket.id].isReady = !this.playerStatus[socket.id].isReady;
	// 	this.update();
	// 	if (this.checkAllReady())
	// 		this.joinGame();
	// }
}

// function checkOwner(socket) {
// 	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, roomOfPlayers[socket.id].owner == socket.id);
// }

// function getRoomOfPlayer(socket) {
// 	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, roomOfPlayers[socket.id]);
// }

function createRoom(socket, mode, username) {
	console.log(`Player ${socket.id} tries to create a new Room with Mode '${mode}':`);
	if ( roomIDOfPlayer[socket.id] ) {
		console.log(`Already in a room.`);
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CREATE, 1); // 用于发送创建房间的状态（若成功附带0和房间号，若失败附带错误码）
		// code 1:已经在一个房间中
		return ;
	}
	let newRoom = new Room(mode, socket.id);
	rooms[newRoom.id] = newRoom;
	console.log(`Player ${socket.id} created Room #${newRoom.id}.`);
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.CREATE, 0, newRoom.id);
	// code 0:成功创建
	joinRoom(socket, mode, username, newRoom.id); // 创建后加入房间
}

function joinRoom(socket, mode, username, roomID) {
	console.log(`Player ${socket.id} tries to join Room #${roomID} with Mode '${mode}':`);
	if ( roomIDOfPlayer[socket.id] ) {
		console.log(`Already in a room.`);
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, 4);
		// code 4:已经在一个房间中
		return ;
	}
	if ( !rooms[roomID] ) {
		console.log(`Room #${roomID} not found.`);
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, 1); // 用于发送加入房间的状态（若成功附带0和房间号，若失败附带错误码）
		// code 1:房间不存在
	} else {
		let currentRoom = rooms[roomID];
		if ( currentRoom.players[socket.id] ) {
			console.log(`Player ${socket.id} is already in the Room`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, 2);
			// code 2:重复加入
		} else if ( currentRoom.playerCount == currentRoom.teamCount * currentRoom.teamSize ) {
			console.log(`Room #${roomID} is full`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, 3);
			// code 3:满人
		} else {
			console.log(`Player ${socket.id} successfully joined the Room #${roomID}`);
			socket.emit(Constants.MSG_TYPES.SERVER.ROOM.JOIN, 0, roomID);
			currentRoom.addPlayer(socket, username);
			// code 0:成功
		}
	}
}

function leaveRoom(socket) {
	const roomID = roomIDOfPlayer[socket.id];
	console.log(`Player ${socket.id} tries to leave Room #${roomID}:`);
	if ( !roomID ) {
		console.log(`Player ${socket.id} is not in a room.`);
		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.LEAVE, 1);
		// code 1: 不在房间中
		return ;
	}
	const room = rooms[roomID];
	console.log(`Player ${socket.id} successfully left Room #${roomID}.`)
	room.removePlayer(socket.id);
	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.LEAVE, 0);
	// code 0: 成功
}

function disconnect(socket) {
	console.log(`Player ${socket.id} disconnected.`);
	leaveRoom(socket);
}

// function quitRoom(socket, needMsg) {
// 	if (!roomOfPlayers[socket.id])
// 		return;
// 	roomOfPlayers[socket.id].remove(socket);
// 	delete roomOfPlayers[socket.id];
// 	if (needMsg)
// 		socket.emit(Constants.MSG_TYPES.SERVER.ROOM.ROOM_MSG, 'Successfully quited the room', 'green');
// 	socket.emit(Constants.MSG_TYPES.SERVER.ROOM.QUIT);
// }

const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fixedIDLen = 6;

function getNewRoomID() {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	let val = arr[0];
	let id = '';
	while (val > 0) {
		id += charList[val % charList.length];
		val = (val - val % charList.length) / charList.length;
	}
	while (id.length < fixedIDLen) {
		id += '0';
	}
	return id;
}

export {
	createRoom,
	joinRoom,
	leaveRoom,
	disconnect,
	// getRoomOfPlayer,
	// checkOwner,
	// rooms,
	// roomOfPlayer,
};