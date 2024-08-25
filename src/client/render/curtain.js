import * as pixi from 'pixi.js';
import * as util from '../utility.js';
import client from '../index.js';

class Curtain {
	// App
	app;

	// pixi container
	container;

	graphics;

	alphaFilter;

	alpha;

	constructor(app) {
		this.app = app;
		this.container = new pixi.Container();
		this.graphics = new pixi.Graphics();
		this.alphaFilter = new pixi.AlphaFilter();
		this.alpha = new util.DynamicNumber(1);
		this.init();
	}

	init() {
		// 添加 graphics 到 container
		this.container.addChild(this.graphics);

		// 添加 filter 到 graphics
		this.graphics.filters = [this.alphaFilter];

		const application = this.app.application;

		// 添加更新函数到 ticker
		application.ticker.add(this.update.bind(this));

		// 添加 onResize 到 App.onResizeFnList
		this.app.appendOnResizeFnList([this.onResize.bind(this)]);

		// 添加 container 到 application.stage
		application.stage.addChild(this.container);
	}

	update() {
		const alpha = this.alpha.get(); // updates the dynamic number
		this.alphaFilter.alpha = alpha;
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.graphics.clear();
		this.graphics.rect(0, 0, W, H).fill('#000000');
	}
	
	setAlpha(alpha) {
		this.alpha.to(alpha);
	}

	on() {
		this.setAlpha(1);
	}

	off() {
		this.setAlpha(0);
	}
}

export default Curtain;