import * as pixi from 'pixi.js';
import Text from './toRoomMenu/text.js';

class ToRoomMenu {
	app;

	container;

	// 文字
	text;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.text = new Text(this);
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

export default ToRoomMenu;