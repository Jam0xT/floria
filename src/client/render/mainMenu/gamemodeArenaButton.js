import * as pixi from 'pixi.js';
import client from '../../index.js';
import textStyles from '../textStyles.js';

class GamemodeArenaButton {
	parent;

	container;

	constructor(parent) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.init();
	}

	init() {
		// 底部的圆角长方形图案
		const g = new pixi.Graphics();
		const width = 200; // 长
		const height = 60; // 宽
		const radius = 10; // 圆角半径
		const strokeWidth = 5; // 边线半径

		g.roundRect(0, 0, width, height, radius);
		g.fill('#cfcfcf');
		g.stroke({
			color: '#919191',
			width: strokeWidth,
		});

		// 转换成 Sprite 便于使用
		const base = new pixi.Sprite(client.app.application.renderer.generateTexture(g));
		base.anchor.set(0.5);
		base.eventMode = 'static';
		base.cursor = 'pointer';
		base.on('pointerdown', this.onClick);

		// 文字
		const text = new pixi.Text({
			text: 'Arena',
			style: textStyles.default(36),
		});
		text.anchor.set(0.5);

		// 加入 container
		this.container.addChild(
			base,
			text,
		);

		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.container.x = W * 0.5;
		this.container.y = H * 0.4;
	}

	onClick() {
		// dont use 'this' here because this function is not bound to an instance
		// find the module you need from 'client'
		client.setGamemode('arena');
		client.setUsername(client.app.mainMenu.usernameInput.get());
		client.setState('get_room');
		client.app.mainMenu.off();
		client.app.getRoomMenu.on();
	}
}

export default GamemodeArenaButton;