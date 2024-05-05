// import { setPetalPosition } from './ui/ui.js';
import Constants from './constants.js';

const layerCount = Constants.canvas.layerCount;
const layerSettings = Constants.canvas.layerSettings;

let canvas = [0]; // canvas编号从1开始，这个0用于占位
let W, H, unitLength;

export {
	layerSettings,
	W, H, unitLength,
	getCtx,
	init,
	setCanvasDimensions,
	Length
};

function getCtx(layer) {
	return canvas[layer].getContext('2d');
}

function init() { // 初始化
	create();
	setCanvasDimensions();
	window.addEventListener('resize', setCanvasDimensions);
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
	const devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	unitLength = Math.max(0.5, W / 1000, H / 1000);
	for ( let i = 1; i <= layerCount; i ++ ) {
		canvas[i].width = W;
		canvas[i].height = H;
		canvas[i].style.width = window.innerWidth + `px`;
		canvas[i].style.height = window.innerHeight + `px`;
	}
}

class Length {
	constructor(W_, H_, unitLength_ = 0) {
		this.w = W_;
		this.h = H_;
		this.unitLength = unitLength_;
	}

	parse() {
		return this.w * W + this.h * H + this.unitLength * unitLength;
	}

	static parseAll(arr) {
		return arr.map(l => l.parse());
	}

	static u(unitLength_ = 0) {
		return new Length(0, 0, unitLength_);
	}
	
	static w(W_, unitLength_ = 0) {
		return new Length(W_, 0, unitLength_);
	}

	static h(H_, unitLength_ = 0) {
		return new Length(0, H_, unitLength_);
	}

	add(l) {
		return new Length(this.w + l.w, this.h + l.h, this.unitLength + l.unitLength);
	}

	sub(l) {
		return new Length(this.w - l.w, this.h - l.h, this.unitLength - l.unitLength);
	}

	mul(k) {
		return new Length(this.w * k, this.h * k, this.unitLength * k);
	}
}