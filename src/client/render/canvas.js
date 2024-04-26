import { setPetalPosition } from './ui/ui.js';
const layerCount = 15;
let canvas = [0];
let W, H, wUnit, hUnit;
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
export {
	layerSettings,
	W, H, wUnit, hUnit,
	getCtx,
	init,
	setCanvasDimensions,
};

main()

function getCtx(layer) {
	return canvas[layer].getContext('2d');
}

function init() { // 初始化
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
	let devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	wUnit = W / 1000;
	hUnit = H / 1000;
	for ( let i = 1; i <= layerCount; i ++ ) {
		canvas[i].width = W;
		canvas[i].height = H;
		canvas[i].style.width = window.innerWidth + `px`;
		canvas[i].style.height = window.innerHeight + `px`;
	}
	setPetalPosition();
}

function main() {
	window.addEventListener('resize', setCanvasDimensions);
}