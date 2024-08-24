import * as pixi from 'pixi.js';
import client from '../index.js';
import GamemodeText from './roomMenu/gamemodeText.js';
import MapList from './roomMenu/mapList.js';
import PlayerList from './roomMenu/playerList.js';
import RoomIDText from './roomMenu/roomIDText.js';
import CopyRoomIDButton from './roomMenu/copyRoomIDButton.js';
import ReadyButton from './roomMenu/readyButton.js';
import LeaveButton from './roomMenu/leaveButton.js';
import TogglePrivateButton from './roomMenu/togglePrivateButton.js';
import IsOwnerText from './roomMenu/isOwnerText.js';

class RoomMenu {
	app;

	container;

	// 游戏模式文字
	gamemodeText;

	// 地图列表
	mapList;

	// 玩家列表
	playerList;

	roomIDText;

	isOwnerText;

	isOwner;

	ownerUUID;

	copyRoomIDButton;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.gamemodeText = new GamemodeText(this);
		this.mapList = new MapList(this);
		this.playerList = new PlayerList(this);
		this.readyButton = new ReadyButton(this);
		this.roomIDText = new RoomIDText(this);
		this.isOwnerText = new IsOwnerText(this);
		this.leaveButton = new LeaveButton(this);
		this.togglePrivateButton = new TogglePrivateButton(this);
		this.copyRoomIDButton = new CopyRoomIDButton(this);
		this.init();
	}

	init() {
		this.off();
		const application = this.app.application;
		this.app.appendOnResizeFnList(this.onResizeFnList);
		application.stage.addChild(this.container);
	}

	appendOnResizeFnList(onResizeFnList) {
		this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}

	setPlayerList(playerDatas) {
		this.playerList.set(playerDatas);
	}

	addPlayer(player) {
		this.playerList.add(player);
	}

	removePlayer(playerData) {
		this.playerList.remove(playerData.uuid);
	}

	setReady(uuid, isReady) {
		this.playerList.setReady(uuid, isReady);
	}

	setOwner(ownerUUID) {
		this.ownerUUID = ownerUUID;
		this.isOwner = (ownerUUID == client.uuid);
		this.isOwnerText.set(`isOwner: ${this.isOwner ? 'true' : 'false'}`);
	}

	setID(roomID) {
		this.roomIDText.set(roomID);
	}

	setGamemode(gamemode) {
		this.gamemodeText.set(gamemode);
		this.mapList.setGamemode(gamemode);
	}

	on() {
		this.container.visible = true;
	}

	off() {
		this.container.visible = false;
	}
}

export default RoomMenu;