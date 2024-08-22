import * as pixi from 'pixi.js';
import textStyles from '../../textStyles.js';

class PlayerNameText {
	parent;

	text;
	
	constructor(parent, text) {
		this.parent = parent;
		this.text = new pixi.Text({
			text: text,
			style: textStyles.default(36),
		});
		this.init();
	}

	init() {
		this.text.anchor.set(0.5);

		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.text);
	}

	onResize() {
		// const W = client.app.W, H = client.app.H;
		this.text.x = 120;
		this.text.y = 0;
	}

	set(text) {
		this.text.text = text;
	}
}

export default PlayerNameText;