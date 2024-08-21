import * as pixi from 'pixi.js';
import Title from './roomMenu/title.js';
import BackButton from './roomMenu/backButton.js';
import CreateButton from './roomMenu/createButton.js';
import FindPublicButton from './roomMenu/findPublicButton.js';
import JoinButton from './roomMenu/joinButton.js';
import RoomIDInput from './roomMenu/roomIDInput.js';

class RoomMenu {
	app;

	container;

	// 标题文字
	title;

	// 后退按钮
	backButton;

	// 房间号输入
	roomIDInput;

	// 创建房间按钮
	createButton;

	// 加入房间按钮
	joinButton;

	// 寻找公开房间按钮
	findPublicButton;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.title = new Title(this);
		this.backButton = new BackButton(this);
		this.roomIDInput = new RoomIDInput(this);
		this.createButton = new CreateButton(this);
		this.joinButton = new JoinButton(this);
		this.findPublicButton = new FindPublicButton(this);
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