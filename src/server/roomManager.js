import Room from './room/room.js';
import logger from './logger.js';

const roomList = {}; // 房间列表

function createRoom(gamemode) {
	const newRoom = new Room(gamemode);
	roomList[newRoom.id] = newRoom;
	logger.room.create(newRoom.id);
	return newRoom;
}

function remove(room) {
	delete roomList[room.id];
}

function get(roomID) {
	return roomList[roomID];
}

function getNewRoomID() {
	const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const fixedIDLen = 6;
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

function findPublic() {
	return Object.values(roomList).find((room) => {
		return !room.isPrivate && room.determineCanRoomAddPlayer().bool;
	})
}

export {
	createRoom,
	remove,
	get,
	getNewRoomID,
	findPublic,
};