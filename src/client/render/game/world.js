import * as pixi from 'pixi.js';
import Background from './world/background.js';
import Entities from './world/entities.js';
import client from '../../index.js';
import * as util from '../../utility.js';

class World {
	container = new pixi.Container({
		background: '',
		isRenderGroup: true,
	});

	game;

	width = 0;

	height = 0;

	// 实际视距
	vision = new util.DynamicNumber(1);

	// 背景
	background = new Background();

	// 实体
	entities = new Entities();

	// 世界坐标
	x = new util.DynamicNumber(0);
	y = new util.DynamicNumber(0);

	constructor(game) {
		this.game = game;
		this.container.addChild(
			this.background.container,
			this.entities.container,
		);
	}

	setLoadDistance(loadDistance) {
		this.entities.setLoadDistance(loadDistance);
	}

	setVision(vision) {
		this.vision.to(vision);
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.background.setSize(width, height);
	}

	// ticker
	update() {
		const state = this.game.state;

		// game.stateProcessor 未初始化，即未收到服务器发送的第一个更新
		if ( !state ) {
			return ;
		}

		const uuid = this.game.selfEntityUUID;
		const x = state.entities[uuid].x, y = state.entities[uuid].y;

		const w = window.innerWidth, h = window.innerHeight;

		const targetX = w / 2 - x, targetY = h / 2 - y;

		this.x.to(targetX);
		this.y.to(targetY);

		this.container.x = this.x.get();
		this.container.y = this.y.get();

		this.entities.update(state, x, y);
	}
}

export default World;