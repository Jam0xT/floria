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
	getAllTextWidth,
	getTextTopHeight,
	reverseString
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

function reverseString(str) {
	return str.split(``).reverse().join(``);
}

function getAllTextWidth(text, size) {
	let ctx = canvas.getTmpCtx();
	ctx.font = `${size}px Ubuntu`;
	ctx.lineWidth = size * 0.125;
	
	let w = 0;
	const textMetrics = ctx.measureText(text);
	w += textMetrics.width;
	w += ctx.lineWidth;
	
	return w;
}

function getTextTopHeight(text, size) {
	let ctx = canvas.getTmpCtx();
	ctx.font = `${size}px Ubuntu`;
	ctx.lineWidth = size * 0.125;

	const textMetrics = ctx.measureText(text);

	return textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
}

function renderText(ctx_, alpha, text, x, y, fontSize, textAlign = 'center', style = 'white') {

	if ( text == '' ) // 防止长度为0报错
		return ;

	ctx_.save(); // 保存主 ctx

	Tl(ctx_, x, y); // o(x, y)

	[x, y, fontSize] = Length.parseAll([x, y, fontSize]); // 转换单位
	const outlineWidth = fontSize * 0.125;
	
	const width = getAllTextWidth(text, fontSize); // 获取文字长宽
	const height = getTextTopHeight(text, fontSize);

	let ctx = canvas.getTmpCtx(width * 3, height * 2); // 获取临时 ctx

	ctx.lineWidth = outlineWidth;
	ctx.font = `${fontSize}px Ubuntu`;
	ctx.textAlign = textAlign;

	ctx.translate(width, height);

	ctx.strokeStyle = "black";
	ctx.strokeText(text, 0, 0);

	ctx.fillStyle = style;
	ctx.fillText(text, 0, 0);

	// 粘贴到主 ctx
	ctx_.globalAlpha = alpha;
	canvas.draw(ctx, ctx_, -width, -height, true);

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