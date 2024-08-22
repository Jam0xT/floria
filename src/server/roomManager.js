import Room_Arena from "./rooms/roomArena.js";
import { TeamPresets } from "./teams.js";
import Arena_Maps from './gamemodes/arena/config/maps.js';
import log from './log.js';

const roomList = {}; // 房间列表

function createRoom(options) {
	switch (options.gamemode) {
		case `arena`: {
			const mapSettings = getMapSettings(`arena`, Object.keys(Arena_Maps)[0]);
			if ( !mapSettings )
				return false;
			
			const teamSetting = TeamPresets.fair(mapSettings.teamCount, mapSettings.teamSize);
			
			const newRoom = new Room_Arena({
				team: teamSetting,
			});
			
			console.log(`${log.green('+')} ${log.gray('#')}${log.blue(newRoom.id)}`);
			roomList[newRoom.id] = newRoom;
			return newRoom;
		}
	}
}

function removeRoom(room) {
	delete roomList[room.id];
}

function getRoomById(roomId) {
	return roomList[roomId];
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

function getMapSettings(gamemode, map) {
	switch (gamemode) {
		case `arena`: {
			return Arena_Maps[map];
		}
	}
}

export {
	createRoom,
	removeRoom,
	getRoomById,
	getNewRoomID,
	findPublic,
	getMapSettings,
};