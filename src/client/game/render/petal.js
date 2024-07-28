import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAsset } from '../../assets.js';

function renderPetal(self, petal) {
	// const ctx = canvas.getTmpCtx();
	const ctx = canvas.ctxMain;

	const { x, y } = petal;
	let asset = getAsset(`petals/${petal.id}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
	const canvasX = W / 2 + (x - self.x) * hpx;
	const canvasY = H / 2 + (y - self.y) * hpx;
	const renderRadius = petal.attr.radius * hpx;
	ctx.translate(canvasX, canvasY);
	ctx.rotate(petal.attr.dir);
	if ( width <= height ) {
		ctx.drawImage(
			asset,
			- renderRadius,
			- renderRadius / width * height,
			renderRadius * 2,
			renderRadius / width * height * 2,
		);
	} else {
		ctx.drawImage(
			asset,
			- renderRadius / height * width,
			- renderRadius,
			renderRadius / height * width * 2,
			renderRadius * 2,
		);
	}
	
	// ctx.beginPath();
	// ctx.arc(0, 0, petal.attr.radius, 0, 2 * Math.PI);
	// ctx.moveTo(0, 0);
	// ctx.lineTo(petal.attr.radius, 0);
	// ctx.closePath();
	// ctx.strokeStyle = '#78fffa';
	// ctx.lineWidth = hpx * 1;
	// ctx.stroke();

	ctx.rotate(-petal.attr.dir);
	ctx.translate(-canvasX, -canvasY);
	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderPetal,
};