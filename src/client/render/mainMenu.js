import * as pixi from 'pixi.js';
import Title from './mainMenu/title.js';
import UsernameInput from './mainMenu/usernameInput.js';
import GamemodeArenaButton from './mainMenu/gamemodeArenaButton.js';
import GamemodeUHCButton from './mainMenu/gamemodeUHCButton.js';
import DiscordButton from './mainMenu/discordButton.js';

class MainMenu {
	app;

	container;

	// 标题文字
	title;

	// 用户名输入
	usernameInput;

	// Arena 游戏模式按钮
	gamemodeArenaButton;

	// UHC 游戏模式按钮
	gamemodeUHCButton;

	// discord 按钮
	discordButton;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.title = new Title(this);
		this.usernameInput = new UsernameInput(this);
		this.gamemodeArenaButton = new GamemodeArenaButton(this);
		// this.gamemodeUHCButton = new GamemodeUHCButton(this);
		this.discordButton = new DiscordButton(this);
		this.init();
	}

	init() {
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

export default MainMenu;