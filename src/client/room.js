import * as nw from './networking.js';

import Constants from '../shared/constants.js';

// import { onJoinRoom } from './vue/App.vue';

var username = '';
const playerList = {};
var isOwner = false;
var playerRoom = null;
// var roomMsg; //显示玩家加入/退出房间是否成功
// var roomMsgCol;
const recieveInfo = () => {
	nw.connectedPromise.then(() => {
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CREATE, createdRoom);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, onJoinRoom);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, updatedRoom);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, gotRoomOfPlayer);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, checkedOwner);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.QUIT, quitedRoom);
		// nw.socket.on(Constants.MSG_TYPES.SERVER.GAME.START, startGame);
	});
}

const setUsername = (newUsername) => {
	username = newUsername;
}

// const createdRoom = (roomId) => {
// 	menus.arena_room_id_input.text = roomId;
// 	menus.arena_room_id_input.style = styles.inputbox.green;
// 	menus.arena_room_id_input.fillColor = styles.inputbox.green.fill;
// }

// const joinedRoom = (nowRoom) => {
// 	playerRoom = nowRoom;
// }

// const updateRoomMsg = (msg, col) => {
// 	roomMsg = msg;
// 	roomMsgCol = col;
// 	menus.arena_room_join_msg.open();
// }

// const updatedRoom = (nowRoom) => {
// 	playerRoom = nowRoom;
// 	if (nowRoom) {
// 		menus.arena_room_ready_button.transparency = 0;
// 		menus.arena_room_quit_button.transparency = 0;
// 	}
// 	else {
// 		menus.arena_room_ready_button.transparency = 100;
// 		menus.arena_room_quit_button.transparency = 100;
// 	}
// }

// const gotRoomOfPlayer = (room) => {
// 	playerRoom = room;
// }

// const checkedOwner = (isOwner_) => {
// 	isOwner = isOwner_;
// }

// const quitedRoom = () => {
// 	playerRoom = null;
// 	menus.arena_room_ready_button.transparency = 100;
// 	menus.arena_room_quit_button.transparency = 100;
// }

const createRoom = (mode, username) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, mode, username);
}

const joinRoom = (mode, username, roomID = '') => {
	// console.log(roomID);
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, mode, username, roomID);
}

const leaveRoom = () => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.LEAVE);
}

// const getRoomOfPlayer = () => {
// 	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.GETROOM);
// }

// const checkOwner = () => {
// 	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.CHECKOWNER);
// }

// const readyChange = () => {
// 	if (playerRoom)
// 		nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.READY);
// }

// const quitRoom = (needMsg) => {
// 	if (playerRoom)
// 		nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.QUIT, needMsg);
// }

// const startGame = () => {
	
// }

export {
	setUsername,
	createRoom,
	joinRoom,
	leaveRoom,
	recieveInfo,
	// getRoomOfPlayer,
	// checkOwner,
	// playerRoom,
	// isOwner,
	// // roomMsg,
	// // roomMsgCol,
	// readyChange,
	// quitRoom,
}