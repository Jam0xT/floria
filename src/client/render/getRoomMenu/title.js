import * as pixi from 'pixi.js';
import textStyles from '../textStyles.js';
import client from '../../client.js';

class Title {
	parent;

	text;
	
	constructor(parent) {
		this.parent = parent;
		this.text = new pixi.Text({
			text: 'Room',
			style: textStyles.default(72),
		});
		this.init();
	}

	init() {
		this.text.anchor.set(0.5);

		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.text);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.text.x = W * 0.5;
		this.text.y = H * 0.2;
	}

}

export default Title;