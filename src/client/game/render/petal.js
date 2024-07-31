import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAssetByEntity } from '../../assets.js';
import * as entityAnim from './entityAnimation.js';

function renderPetal(ctx, self, petal) {

	const { x, y } = petal;
	const asset = getAssetByEntity(petal);
	const canvasX = W / 2 + (x - self.x) * hpx;
	const canvasY = H / 2 + (y - self.y) * hpx;
	const renderRadius = petal.attr.radius * hpx;
	
	entityAnim.recordEntity(petal);
	
	canvas.drawImage(ctx, asset, canvasX, canvasY, petal.attr.dir, renderRadius);
	
	const attributes = entityAnim.getEntityRenderAttributes(petal);
	if (attributes.color.cover != `none`) {
		const color = attributes.color.cover;
		const alpha = petal.attr.ghost ? 0.2 : attributes.color.alpha.get();
		canvas.fillColorOnAsset(ctx, asset, color, alpha, canvasX, canvasY, petal.attr.dir, renderRadius);
		return;
	}
	
	
	//canvas.drawImage(ctx, asset, canvasX, canvasY, petal.attr.dir, renderRadius, alpha);
	
	// ctx.beginPath();
	// ctx.arc(0, 0, petal.attr.radius, 0, 2 * Math.PI);
	// ctx.moveTo(0, 0);
	// ctx.lineTo(petal.attr.radius, 0);
	// ctx.closePath();
	// ctx.strokeStyle = '#78fffa';
	// ctx.lineWidth = hpx * 1;
	// ctx.stroke();

	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderPetal,
};