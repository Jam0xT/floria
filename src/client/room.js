import * as nw from './networking.js';

import Constants from '../shared/constants.js';

export default class Room {
	static createRoom(type) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, {
			room: {
				type: type
			}
		})
		nw.ws.send(data)
	}
	
	static joinRoom(roomId) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, {
			room: {
				id: roomId
			}
		})
		nw.ws.send(data)
	}
	
	static leaveRoom() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.LEAVE, { })
		nw.ws.send(data)
	}
	
	static switchReady() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.READY, { })
		nw.ws.send(data)
	}
	
	static kickPlayer(uuid) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.KICK_PLAYER, {
			player: {
				uuid: uuid
			}
		})
		nw.ws.send(data)
	}
	
	static updateSettings(settings) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.UPDATE_SETTINGS, {
			room: {
				isPrivate: settings.isPrivate,
				map: settings.map,
			}
		})
		nw.ws.send(data)
	}
}

/*
const updSettings = (type, update) => {
	nw.socket.emit(Constants.MSG_TYPES.CLIENT.ROOM.SETTINGS, type, update);
};
*/