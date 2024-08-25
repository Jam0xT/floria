import * as pixi from 'pixi.js';
import Text from './errorMenu/text.js';
import BackButton from './errorMenu/backButton.js';

class ErrorMenu {
	app;

	container;

	// 文字
	text;

	backButton;

	onResizeFnList;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.onResizeFnList = [];
		this.text = new Text(this);
		this.backButton = new BackButton(this);
		this.init();
	}

	setText(text) {
		this.text.set(text);
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

export default ErrorMenu;