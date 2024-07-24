// import { setPetalPosition } from './ui/ui.js';

let canvas; // 主画布
let ctxMain;
let W, H, hpx;

function init() { // 初始化
	canvas = document.getElementById('canvas');
	ctxMain = canvas.getContext('2d');
	handleWindowResize();
	window.addEventListener('resize', handleWindowResize);
}

function getTmpCtx(w = W, h = H) { // 返回临时画布
	let newCanvas = createCanvas();
	newCanvas.width = w;
	newCanvas.height = h;
	return newCanvas.getContext('2d');
}

function draw(ctx, onCtx, x = 0, y = 0, remove = true) {
	onCtx.drawImage(ctx.canvas, x, y);
	if ( remove ) {
		ctx.canvas.remove();
	}
}

function createCanvas(id = undefined) { // 创建canvas
	let newCanvas = document.createElement('canvas');
	if ( id ) {
		newCanvas.id = id;
		document.body.append(newCanvas);
	}
	newCanvas.classList.add('canvas');
	return newCanvas;
}

function handleWindowResize() {
	const devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	hpx = H / 1000;
	setCanvasDimensions(canvas);
}

function setCanvasDimensions(canvas_) {
	canvas_.width = W;
	canvas_.height = H;
	canvas_.style.width = window.innerWidth + `px`;
	canvas_.style.height = window.innerHeight + `px`;
}

export {
	W, H, hpx,
	ctxMain,
	init,
	getTmpCtx,
	draw, 
};