const layerCount = 15;
let canvas = [0];

let layerSettings = { 
	backgroundLayer: [1],
	dropLayer: [2],
	petalLayer: [3, 4],
	mobLayer: [5],
	playerLayer: [6],
	effectLayer: [7],
	shadeLayer: [8],
	UILayer: [9],
	menuLayer: [10, 11, 12, 13],
};
export { layerSettings };

export function getCtx(layer) {
	return canvas[layer].getContext('2d');
}

export function init() { // 初始化
	create();

}

function create() { // 创建canvas
	for (let i = 1; i <= layerCount; i ++ ) {
		let newCanvas = document.createElement('canvas');
		newCanvas.id = `canvas-${i}`;
		document.body.append(newCanvas);
		canvas.push(document.getElementById(`canvas-${i}`));
		canvas[i].classList.add('canvas');
		canvas[i].style['z-index'] = i;
	}
}

function setCanvasDimensions() {
	
}