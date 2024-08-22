import Room_Arena from "./roomArena.js";
import { TeamPresets } from "../teams.js";
import Arena_Maps from '../gamemodes/arena/config/maps.js';

export default class Room {
	
	//room列表
	static list = {};
	
	static createRoom(type, map, isPrivate = false) {
		switch (type) {
			case `arena`: {
				const mapSettings = Room.getMapSettings(`arena`, map);
				if (!mapSettings) return false;
				
				const teamSetting = TeamPresets.fair(mapSettings.teamCount, mapSettings.teamSize)
				
				const newRoom = new Room_Arena({
					team: teamSetting,
					isPrivate: isPrivate
				});
				
				console.log(`room ` +newRoom.id +` created`)
				Room.list[newRoom.id] = newRoom;
				return newRoom;
			}
		}
	}
	
	static removeRoom(room) {
		delete Room.list[room.id];
	}
	
	static getRoomById(roomId) {
		return Room.list[roomId];
	}
	
	static getNewRoomID() {
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
	
	static findPublic() {
		return Object.values(Room.list).find((room) => {
			return !room.isPrivate && room.determineCanRoomAddPlayer().bool;
		})
	}
	
	static getMapSettings(type, map) {
		switch (type) {
			case `arena`: {
				return Arena_Maps[map];
			}
		}
	}
}