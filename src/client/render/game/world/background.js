import * as pixi from 'pixi.js';

class Background {
	width = 0;

	height = 0;

	gridInterval = 40;

	container = new pixi.Container({
		background: '#1b9657',
	});

	gridLines = new pixi.Graphics();

	constructor() {
		this.container.addChild(this.gridLines);
		const gridLines = this.gridLines;
		for (let i = -500; i <= 10500; i += this.gridInterval ) {
			gridLines.moveTo(-500, i);
			gridLines.lineTo(10500, i);
			gridLines.stroke({
				width: 1,
				color: '#000000',
			});
			gridLines.moveTo(i, -500);
			gridLines.lineTo(i, 10500);
			gridLines.stroke({
				width: 1,
				color: '#000000',
			});
		}
	}

	setSize(width, height) {
		
	}
}

export default Background;