import * as pixi from 'pixi.js';
import * as pixiui from '@pixi/ui';
import textStyles from '../textStyles.js';
import client from '../../client.js';

class UsernameInput {
	parent;

	container;

	input;

	constructor(parent) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.input = new pixiui.Input({
			textStyle: textStyles.default(24),
			maxLength: 20,
			align: 'center',
			placeholder: 'username',
		});
		this.init();
	}

	init() {
		// 底部的圆角长方形图案
		const g = new pixi.Graphics();
		const width = 500; // 长
		const height = 40; // 宽
		const radius = 5; // 圆角半径
		const strokeWidth = 3; // 边线半径

		g.roundRect(0, 0, width, height, radius);
		g.fill('#cfcfcf');
		g.stroke({
			color: '#919191',
			width: strokeWidth,
		});

		// 输入框
		const input = this.input;
		input.bg = g;

		input.pivot.x = input.width / 2;
		input.pivot.y = input.height / 2;

		this.container.addChild(
			input,
		);

		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.container.x = W * 0.5;
		this.container.y = H * 0.8;
	}

	get() {
		return this.input.value;
	}
}

export default UsernameInput;