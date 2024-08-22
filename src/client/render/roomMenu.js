import * as pixi from 'pixi.js';
import GamemodeText from './roomMenu/gamemodeText.js';
import MapList from './roomMenu/mapList.js';
import PlayerList from './roomMenu/playerList.js';
import RoomIDText from './roomMenu/roomIDText.js';
import CopyRoomIDButton from './roomMenu/copyRoomIDButton.js';
import ReadyButton from './roomMenu/readyButton.js';

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