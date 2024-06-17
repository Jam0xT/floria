import * as nw from '../networking.js';

import Constants from '../../shared/constants.js';

import { menus } from './startScreen/main.js';

import styles from './styles.js';

const playerList = {};
var isOwner = false;
var playerRoom = null;
var joinRoomExitCode = 1;
const recieveInfo = () => {
	nw.connectedPromise.then(() => {
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CREATE, createdRoom);
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, joinedRoom);
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.UNSUCCESSFUL_JOIN, unsuccessfulJoinedRoom);
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, gotRoomOfPlayer);
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, checkedOwner);
	});
}
const createdRoom = (roomId) => {
	menus.arena_room_id_input.text = roomId;
	menus.arena_room_id_input.style = styles.inputbox.green;
	menus.arena_room_id_input.fillColor = styles.inputbox.green.fill;
}
const joinedRoom = (nowRoom) => {
	joinRoomExitCode = 1;
	playerRoom=JSON.parse(nowRoom);
	menus.arena_room_join_msg.open();
}
const unsuccessfulJoinedRoom = (exitCode) => {
	joinRoomExitCode = exitCode;
	menus.arena_room_join_msg.open();
}
const gotRoomOfPlayer = (room) => {
	playerRoom = room;
}
const checkedOwner = (isOwner_) => {
	isOwner = isOwner_;
}
const createRoom = (mode) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, mode);
}

const joinRoom = (mode, roomId) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, mode, roomId);
}
const getRoomOfPlayer = () => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.GETROOM);
}
const checkOwner = () => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.CHECKOWNER);
}
export {
	createRoom,
	joinRoom,
	recieveInfo,
	menus,
	getRoomOfPlayer,
	checkOwner,
	playerRoom,
	isOwner,
	joinRoomExitCode,
}