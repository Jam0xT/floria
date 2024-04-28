import {W, H} from './canvas.js';

export function renderHitbox(ctx, radius) {
	ctx.beginPath();
	ctx.arc(0, 0, radius, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.strokeStyle = '#242424';
	ctx.lineWidth = hpx * 1;
	ctx.stroke();
}

export function fillBackground(ctx, fillStyle) {
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, W, H);
}

export function renderRoundRect(ctx, x, y, w, h, r, r4, r1, r2, r3) { // r1 -> r4 clockwise, r4: top left | NOTE: path ONLY, no STROKE
	if ( w < 2 * r ) {
		w = 2 * r;
	}
	if ( h < 2 * r ) {
		h = 2 * r;
	}
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	if ( r1 ) {
	    ctx.arcTo(x+w, y, x+w, y+h, r);
	} else {
		ctx.lineTo(x+w, y);
	}
	if ( r2 ) {
		ctx.arcTo(x+w, y+h, x, y+h, r);
	} else {
		ctx.lineTo(x+w, y+h);
	}
	if ( r3 ) {
    	ctx.arcTo(x, y+h, x, y, r);
	} else {
		ctx.lineTo(x, y+h);
	}
	if ( r4 ) {
    	ctx.arcTo(x, y, x+w, y, r);
	} else {
		ctx.lineTo(x, y);
	}
	ctx.closePath();
}

export function renderText(ctx, alpha, text, x, y, fontSize, textAlign) {
	if ( fontSize ) {
		ctx.lineWidth = fontSize * 0.125;
		ctx.font = `${fontSize}px Ubuntu`;

		ctx.textAlign = textAlign;
	}

	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeStyle = "black";
	ctx.strokeText(text, x, y);

	if (alpha == 0) {
		ctx.globalAlpha = alpha;
	} else {
		ctx.globalAlpha = 1;
	}
	ctx.globalCompositeOperation = 'destination-out';
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);

	ctx.globalAlpha = alpha;
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = "white";
	ctx.fillText(text, x, y);

	ctx.globalAlpha = 1;
}

export function getNumberDisplay(x) { // 1000 -> 1.0k etc.
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

export function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}