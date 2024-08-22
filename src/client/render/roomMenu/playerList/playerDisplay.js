import * as pixi from 'pixi.js';
import PlayerNameText from './playerNameText.js';
import KickButton from './kickButton.js';

class PlayerDisplay {
	parent;

	container;

	isReady;

	username;

	displayIndex;

	playerNameText;

	kickButton;

	onResizeFnList;

	constructor(parent, data, index) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.displayIndex = index;
		this.isReady = data.isReady;
		this.username = data.username;
		this.onResizeFnList = [];
		this.init();
	}

	init() {
		this.playerNameText = new PlayerNameText(this, this.username, this.isReady);
		this.kickButton = new KickButton(this);
		this.onResize();
		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	appendOnResizeFnList(onResizeFnList) {
		this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		// const W = client.app.W, H = client.app.H;
		this.container.x = 0;
		this.container.y = 50 * this.displayIndex;
		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}

	destroy() {
		this.playerNameText.text.destroy(true);
		this.kickButton.container.destroy(true);
	}
};

export default PlayerDisplay;