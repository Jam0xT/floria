import * as pixi from 'pixi.js';
import textStyles from '../textStyles.js';
import client from '../../index.js';

class Text {
	parent;

	text;
	
	constructor(parent) {
		this.parent = parent;
		this.text = new pixi.Text({
			text: '',
			style: textStyles.default(72),
		});
		this.init();
	}

	init() {
		this.text.anchor.set(0.5);

		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.text);
	}

	set(text) {
		this.text.text = text;
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.text.x = W * 0.5;
		this.text.y = H * 0.3;
	}
}

export default Text;