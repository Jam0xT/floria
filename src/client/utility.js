import { W, H } from './render/canvas.js';
import Length from './render/length.js';
import * as canvas from './render/canvas.js';

export {
	renderHitbox,
	fillBackground,
	clear,
	renderRoundRect,
	renderText,
	getNumberDisplay,
	random,
	inRange,
	generators as gen,
	setCursorStyle,
	nop,
	parseTransparency,
	Tl, Tf, Tf0,
	blendAlpha,
}

function renderHitbox(ctx, radius) { // 不应该在这个文件
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.strokeStyle = '#242424';
	ctx.lineWidth = 1;
	ctx.stroke();
}

function fillBackground(ctx, fillStyle) {
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, W, H);
}

function clear(ctx) {
	ctx.clearRect(0, 0, W, H);
}

function renderRoundRect(ctx, x, y, w, h, r) {
	[x, y, w, h] = Length.parseAll([x, y, w, h]);
	r = Length.parseAll(r);
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, r);
}

function renderText(ctx_, alpha, text, x, y, fontSize, textAlign = 'center', style = 'white') {
	ctx_.save(); // 保存主 ctx
	Tl(ctx_, x, y); // o(x, y)

	let ctx = canvas.getTmpCtx(); // 获取临时 ctx

	[x, y, fontSize] = Length.parseAll([x, y, fontSize]);

	const outlineWidth = fontSize * 0.125;

	ctx.lineWidth = outlineWidth;
	ctx.font = `${fontSize}px Ubuntu`;

	ctx.textAlign = textAlign;

	// let offsetX = 0, offsetY = fontSize * 1.5; // 防止文本超出临时ctx范围

	// if ( textAlign == 'left' ) {
	// 	offsetX = outlineWidth;
	// } else if ( textAlign == 'center' ) {
	// 	offsetX = H * 0.5;
	// }
	// ctx.translate(offsetX, offsetY);

	ctx.globalCompositeOperation = 'source-over'; // 渲染文本
	ctx.strokeStyle = "black";
	ctx.strokeText(text, 0, 0);

	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = "white";
	ctx.fillText(text, 0, 0);

	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = style;
	ctx.fillText(text, 0, 0);

	// 粘贴到主 ctx

	ctx_.globalAlpha = alpha;
	// canvas.draw(ctx, ctx_, -offsetX, -offsetY, true);
	canvas.draw(ctx, ctx_, 0, 0, true);
	ctx_.globalAlpha = 1;

	// 恢复主 ctx

	ctx_.restore();
}

function getNumberDisplay(x) { // 1000 -> 1.0k etc.
	if ( x >= 10**10 ) {
		const digitNumber = Math.floor(Math.log10(x));
		x = Math.floor(x / 10**(digitNumber - 1)) / 10;
		x = x.toFixed(1) + 'e+' + digitNumber;
	} else if ( x >= 10**9 ) {
		x = Math.floor(x / 10**8) / 10;
		x = x.toFixed(1) + 'b';
	} else if ( x >= 10**6 ) {
		x = Math.floor(x / 10**5) / 10;
		x = x.toFixed(1) + 'm';
	} else if ( x >= 1000 ) {
		x = Math.floor(x / 100) / 10;
		x = x.toFixed(1) + 'k';
	}
	return x;
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inRange(x, l, r) {
	return ( x >= l ) && ( x <= r );
}

const generators = {
	linear_decrease: function* (i, n, k) { // 从i开始每次-k直到n
		while ( i >= n ) {
			yield i;
			i -= k;
		}
		yield n;
	},
	linear_increase: function* (i, n, k) { // 从i开始每次+k直到n
		while ( i <= n ) {
			yield i;
			i += k;
		}
		yield n;
	},
	exponential_decrease: function* (i, n, k) { // 指数衰减
		while ( i - n >= 0.1 ) {
			yield i;
			i = n + (i - n) * k;
		}
		yield n;
	},
	logarithmic_increase: function* (i, n, k) { // 对数增长（把指数衰减翻转）
		while ( i <= n - 0.1 ) {
			yield i;
			i = n - (n - i) * k;
		}
		yield n;
	},
}

function setCursorStyle(style) {
	// default, pointer, wait, crosshair, not-allowed, zoom-in, grab
	document.body.style.cursor = style;
}

function nop() {}

function parseTransparency(transparency) { // 0-100
	return (1.00 - transparency * 0.01);
}

function Tl(ctx, x, y) {
	[x, y] = Length.parseAll([x, y]);
	ctx.translate(x, y);
}

function Tf(ctx, x, y) {
	[x, y] = Length.parseAll([x, y]);
	ctx.transform(1, 0, 0, 1, x, y);
}

function Tf0(ctx) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function blendAlpha(ctx, alpha) {
	ctx.globalAlpha = ctx.globalAlpha * alpha;
}