import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAsset } from '../../assets.js';

function renderPetal(self, petal) {
	// const ctx = canvas.getTmpCtx();
	const ctx = canvas.ctxMain;

	const { x, y } = petal;
	let asset = getAsset(`petals/${petal.id}.svg`);
	const canvasX = W / 2 + (x - self.x) * hpx;
	const canvasY = H / 2 + (y - self.y) * hpx;
	const renderRadius = petal.attr.radius * hpx;
	ctx.translate(canvasX, canvasY);
	
	const width = asset.naturalWidth, height = asset.naturalHeight;

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

	ctx.translate(-canvasX, -canvasY);
	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderPetal,
};