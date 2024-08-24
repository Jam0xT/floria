import * as pixi from 'pixi.js';
import client from '../../index.js';
import PlayerDisplay from './playerList/playerDisplay.js';

class PlayerList {
	parent;

	container;

	players;

	onResizeFnList;

	constructor(parent) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.players = {};
		this.onResizeFnList = [];
		this.init();
	}

	init() {
		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	appendOnResizeFnList(onResizeFnList) {
		return this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.container.x = W * 0.7;
		this.container.y = H * 0.2;
		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}

	set(players) {
		Object.values(this.players).forEach(playerDisplay => {
			playerDisplay.destroy();
		});
		this.players = {};
		this.onResizeFnList = [];

		players.forEach((player, index) => {
			const newPlayerDisplay = new PlayerDisplay(this, player, index);
			this.players[player.uuid] = newPlayerDisplay;
		});
	}

	add(player) {
		const newPlayerDisplay = new PlayerDisplay(this, player, Object.keys(this.players).length);
		this.players[player.uuid] = newPlayerDisplay;
	}

	remove(playerUUID) {
		const playerDisplay = this.players[playerUUID];
		playerDisplay.destroy();
		delete this.players[playerUUID];
		delete this.onResizeFnList[playerDisplay.onResizeFnIndex];
	}

	setReady(uuid, isReady) {
		const playerDisplay = this.players[uuid];
		playerDisplay.setReady(isReady);
	}
}

export default PlayerList;