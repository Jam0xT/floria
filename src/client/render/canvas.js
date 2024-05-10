// import { setPetalPosition } from './ui/ui.js';

let canvas; // 主画布
let W, H, unitLength;

export {
	W, H, unitLength,
	init,
	getTmpCtx,
	draw, 
};

function init() { // 初始化
	canvas = createCanvas('canvas');
	handleWindowResize();
	window.addEventListener('resize', handleWindowResize);
}

function getTmpCtx() { // 返回临时画布
	let newCanvas = createCanvas();
	setCanvasDimensions(newCanvas);
	return newCanvas.getContext('2d');
}

function draw(ctx, remove = true) {
	canvas.getContext('2d').drawImage(ctx.canvas, 0, 0);
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
	// newCanvas.style['z-index'] = 1;
	return newCanvas;
}

function handleWindowResize() {
	const devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	unitLength = Math.max(0.5, W / 1000, H / 1000);
	setCanvasDimensions(canvas);
}

function setCanvasDimensions(canvas_) {
	canvas_.width = W;
	canvas_.height = H;
	canvas_.style.width = window.innerWidth + `px`;
	canvas_.style.height = window.innerHeight + `px`;
}