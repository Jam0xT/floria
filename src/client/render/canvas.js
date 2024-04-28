import { setPetalPosition } from './ui/ui.js';
const layerCount = 15;
let canvas = [0]; // canvas编号从1开始，这个0用于占位
let W, H, wUnit, hUnit;
let layerSettings = { 
	game: {
		background: [1],
		drop: [2],
		petal: [3, 4],
		mob: [5],
		player: [6],
		effect: [7],
		shade: [8],
		UI: [9],
	},
	startScreen: {
		background: [1],
	}
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