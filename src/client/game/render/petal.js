import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAsset } from '../../assets.js';
import { vision } from '../main.js';

function renderPetal(ctx, self, petal) {
	let u = hpx / vision;

	const { x, y } = petal;
	let asset = getAsset(`petals/${petal.id}.svg`);
	const width = asset.naturalWidth, height = asset.naturalHeight;
	const canvasX = W / 2 + (x - self.x) * u;
	const canvasY = H / 2 + (y - self.y) * u;
	const renderRadius = petal.attr.radius * u;
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
	// ctx.lineWidth = u * 1;
	// ctx.stroke();

	ctx.rotate(-petal.attr.dir);
	ctx.translate(-canvasX, -canvasY);
	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderPetal,
};