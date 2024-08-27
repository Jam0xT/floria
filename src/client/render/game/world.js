import * as pixi from 'pixi.js';
import Background from './world/background.js';

class World {
	container = new pixi.Container({
		background: '',
		isRenderGroup: true,
	});

	game;

	width = 0;

	height = 0;

	background = new Background();

	constructor(game) {
		this.game = game;
		this.container.addChild(this.background.container);
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;
		this.background.setSize(width, height);
	}

	update() {
		const state = this.game.state;

		// game.stateProcessor 未初始化，即未收到服务器发送的第一个更新
		if ( !state ) {
			return ;
		}

		const x = state.self.x, y = state.self.y;

		const w = window.innerWidth, h = window.innerHeight;

		const targetX = w / 2 - x, targetY = h / 2 - y;

		this.container.x += (targetX - this.container.x) * 0.1;
		this.container.y += (targetY - this.container.y) * 0.1;
	}
}

export default World;