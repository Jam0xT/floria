import * as pixi from 'pixi.js';
import textStyles from '../textStyles.js';
import client from '../../index.js';
import * as util from '../../utility.js';

class RoomIDText {
	parent;

	text;
	
	constructor(parent) {
		this.parent = parent;
		this.text = new pixi.Text({
			text: '',
			style: textStyles.default(48),
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
		this.text.x = W * 0.1;
		this.text.y = H * 0.2;
	}

	set(text) {
		this.text.text = text;
	}
}

export default RoomIDText;