import * as nw from './networking.js';
import client from './client.js';
import Constants from '../shared/constants.js';

class Room {
	static requestCreateRoom(options) {
		const data = nw.createData(
			Constants.MSG_TYPES.CLIENT.ROOM.CREATE,
			{
				options,
			}
		);
		nw.ws.send(data);
	}
	
	static requestJoinRoom(options) {
		const data = nw.createData(
			Constants.MSG_TYPES.CLIENT.ROOM.JOIN,
			{
				options,
			}
		);
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
			settings: settings,
		})
		nw.ws.send(data);
	}
	
	static requestFindPublicRoom() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.FIND_PUBLIC_ROOM, { });
		nw.ws.send(data);
	}
}

export default Room;