import * as nw from './networking.js';
import client from './index.js';
import Constants from '../shared/constants.js';

class Room {
	// 房间 id
	id;

	// 所有玩家信息
	players = {};

	// 自身是否准备好
	isReady = false;

	// 房间 owner 的 uuid
	ownerUUID;

	// 地图 id
	mapID;

	// 是否公开
	isPrivate = true;

	constructor() {
	}

	onLeave() {
		client.onLeaveRoom();
	}

	onJoin(room) {
		this.setID(room.id);
		this.setOwner(room.ownerUUID);
		this.setPlayers(room.players);
	}

	toggleReady() {
		const menu = client.app.roomMenu;
		this.isReady = !this.isReady;
		this.players[client.uuid].isReady = this.isReady;
		menu.setReady(client.uuid, this.isReady);
		this.requestSetReady();
	}

	setID(roomID) {
		const menu = client.app.roomMenu;
		this.id = roomID;
		menu.setID(roomID);
	}

	setOwner(ownerUUID) {
		const menu = client.app.roomMenu;
		this.ownerUUID = ownerUUID;
		menu.setOwner(ownerUUID);
	}
	
	setPlayers(players) {
		const menu = client.app.roomMenu;
		players.forEach(player => {
			this.players[player.uuid] = player;
		});
		menu.setPlayerList(players);
	}

	// 加入玩家啊
	addPlayer(player) {
		const menu = client.app.roomMenu;
		this.players[player.uuid] = player;
		menu.addPlayer(player);
	}

	// 移除玩家
	removePlayer(player) {
		const menu = client.app.roomMenu;
		delete this.players[player.uuid];
		menu.removePlayer(player);
	}

	// 设置玩家准备状态
	playerReady(player) {
		const menu = client.app.roomMenu;
		this.players[player.uuid].isReady = player.isReady;
		menu.setReady(player.uuid, player.isReady);
	}

	requestCreateRoom() {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, {
			gamemode: client.gamemode,
			username: client.username,
		});
		client.setState('to_room');
		client.app.getRoomMenu.off();
		client.app.toRoomMenu.on();
	}
	
	requestJoinRoom() {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, {
			username: client.username,
			roomID: client.app.getRoomMenu.getRoomIDInput(),
		});
		client.setState('to_room');
		client.app.getRoomMenu.off();
		client.app.toRoomMenu.on();
	}
	
	requestLeaveRoom() {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.ROOM.LEAVE, {});
		client.onLeaveRoom();
	}

	requestSetReady() {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.ROOM.READY, {
			isReady: this.isReady,
		});
	}

	requestKickPlayer(uuid) {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.ROOM.KICK_PLAYER, {
			uuid: uuid,
		});
	}
	
	// requestUpdateSettings(settings) {
	// 	const data = nw.createData(Constants.MSG_TYPES.CLIENT.ROOM.UPDATE_SETTINGS, {
	// 		settings: settings,
	// 	})
	// 	nw.ws.send(data);
	// }
	
	// requestFindPublicRoom() {
	// 	const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.FIND_PUBLIC_ROOM, { });
	// 	nw.ws.send(data);
	// }
}

export default Room;