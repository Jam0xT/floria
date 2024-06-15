import * as nw from '../networking.js';

import Constants from '../../shared/constants.js';

import { menus } from './startScreen/main.js';

import styles from './styles.js';

const playerList = {};

const recieveInfo = () => {
	nw.connectedPromise.then(() => {
		nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, joinedRoom);
	});
}

const joinedRoom = (roomId) => {
	menus.arena_room_id_input.text = roomId;
	menus.arena_room_id_input.style = styles.inputbox.green;
	menus.arena_room_id_input.fillColor = styles.inputbox.green.fill;
}

const createRoom = (mode) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, mode);
}

const joinRoom = (mode, roomId) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, mode, roomId);
}

export {
	createRoom,
	joinRoom,
	recieveInfo,
	menus,
}