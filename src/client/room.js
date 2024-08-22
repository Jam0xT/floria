import * as nw from './networking.js';
import client from './client.js';
import Constants from '../shared/constants.js';

class Room {
	static requestCreateRoom(type, map, isPrivate) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, {
			self: {
				username: client.username
			},
			room: {
				type: type,
				map: map,
				isPrivate: isPrivate,
			}
		});
		nw.ws.send(data);
	}
	
	static requestJoinRoom(roomId) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, {
			self: {
				username: client.username
			},
			room: {
				id: roomId
			}
		});
		nw.ws.send(data);
	}
	
	static requestLeaveRoom() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.LEAVE, { });
		nw.ws.send(data);
	}
	
	static requestSwitchReady() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.READY, { });
		nw.ws.send(data);
	}
	
	static requestKickPlayer(uuid) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.KICK_PLAYER, {
			player: {
				uuid: uuid
			}
		});
		nw.ws.send(data);
	}
	
	static requestUpdateSettings(settings) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.UPDATE_SETTINGS, {
			room: {
				isPrivate: settings.isPrivate,
				map: settings.map,
			}
		})
		nw.ws.send(data);
	}
	
	static requestFindPublicRoom() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.FIND_PUBLIC_ROOM, { });
		nw.ws.send(data);
	}
}

export default Room;