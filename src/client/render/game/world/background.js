import * as pixi from 'pixi.js';

class Background {
	width = 0;

	height = 0;

	gridInterval = 40;

	container = new pixi.Container();

	gridLines = new pixi.Graphics();

	// 底色
	g1 = new pixi.Graphics();

	// 前面的颜色
	g2 = new pixi.Graphics();

	constructor() {
		this.container.addChild(this.g1, this.g2, this.gridLines);
		const gridLines = this.gridLines;
		for (let i = -2000; i <= 10000; i += this.gridInterval ) {
			gridLines.moveTo(-2000, i);
			gridLines.lineTo(10000, i);
			gridLines.stroke({
				width: 1,
				alpha: 0.1,
				color: '#000000',
			});
			gridLines.moveTo(i, -2000);
			gridLines.lineTo(i, 10000);
			gridLines.stroke({
				width: 1,
				alpha: 0.1,
				color: '#000000',
			});
		}

		this.g1.rect(-2000, -2000, 10000, 10000);
		this.g1.fill('1ea761');
		const f = new pixi.ColorMatrixFilter();
		f.brightness(0.85, true);
		this.g1.filters = [f];
	}

	setSize(width, height) {
		console.log('setsize');
		this.g2.clear();
		this.g2.rect(0, 0, width, height);
		this.g2.fill('1ea761');
	}
}

export default Background;