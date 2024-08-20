import Room_Arena from "./room-arena.js";

export default class Room {
	
	//room列表
	static list = {};
	
	static createRoom(type) {
		switch (type) {
			case `arena`: {
				const newRoom = new Room_Arena();
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
}