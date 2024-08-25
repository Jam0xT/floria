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

	onResizeFnIndex;

	uuid;

	constructor(parent, data, index) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.isReady = data.isReady;
		this.displayIndex = index;
		this.username = data.username;
		this.uuid = data.uuid;
		this.onResizeFnList = [];
		this.init();
	}

	init() {
		this.playerNameText = new PlayerNameText(this, this.username);
		this.kickButton = new KickButton(this, this.uuid);
		this.onResize();
		this.onResizeFnIndex = this.parent.appendOnResizeFnList([this.onResize.bind(this)]) - 1;
		this.parent.container.addChild(this.container);
	}

	setReady(isReady) {
		this.isReady = isReady;
		this.playerNameText.text.style.fill = this.isReady ? '#b4fa9b' : "#ffffff";
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