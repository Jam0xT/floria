import * as pixi from 'pixi.js';
import client from '../../client.js';
import PlayerDisplay from './playerList/playerDisplay.js';

class PlayerList {
	parent;

	container;

	players;

	onResizeFnList;

	constructor(parent) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.players = [];
		this.onResizeFnList = [];
		this.init();
	}

	init() {
		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	appendOnResizeFnList(onResizeFnList) {
		this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.container.x = W * 0.7;
		this.container.y = H * 0.2;
		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}

	set(playerDatas) {
		this.players.forEach(playerDisplay => {
			playerDisplay.destroy();
		});
		this.players = [];

		playerDatas.forEach((playerData, index) => {
			const newPlayerDisplay = new PlayerDisplay(this, playerData, index);
			this.players.push(newPlayerDisplay);
		});
	}

}

export default PlayerList;