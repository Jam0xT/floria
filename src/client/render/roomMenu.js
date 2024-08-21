import * as pixi from 'pixi.js';
import GamemodeText from './roomMenu/gamemodeText.js';

class RoomMenu {
	app;

	container;

	// 游戏模式文字
	gamemodeText;

	// 地图列表
	mapList;

	// 玩家列表
	playerList;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.gamemodeText = new GamemodeText(this);
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

	on() {
		this.container.visible = true;
	}

	off() {
		this.container.visible = false;
	}
}

export default RoomMenu;