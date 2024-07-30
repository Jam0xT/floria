import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { settings } from '../main.js';

function renderBackground(ctx, x, y, mspt) {
	const gridInterval = hpx * 50;
	
	const startX = ( W / 2 - x * hpx ) % gridInterval;
	const startY = ( H / 2 - y * hpx ) % gridInterval;
	
	const gridLineWidth = hpx * 0.5;

	ctx.fillStyle = `rgb(28, 154, 89)`;
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = `rgb(30, 167, 97)`;
	ctx.fillRect(W / 2 - x * hpx, H / 2 - y * hpx, settings.map_width * hpx, settings.map_height * hpx)

	const gridLineStyle = `rgba(0, 0, 0, 0.3)`;
	for ( let ix = startX; ix < W; ix += gridInterval) {
		ctx.beginPath();
		ctx.moveTo(ix, 0);
		ctx.lineTo(ix, H);
		ctx.strokeStyle = gridLineStyle;
		ctx.lineWidth = gridLineWidth;
		ctx.stroke();
		ctx.closePath();
	}
	
	for ( let iy = startY; iy < H; iy += gridInterval) {
		ctx.beginPath();
		ctx.moveTo(0, iy);
		ctx.lineTo(W, iy);
		ctx.strokeStyle = gridLineStyle;
		ctx.lineWidth = gridLineWidth;
		ctx.stroke();
		ctx.closePath();
	}

	ctx.fillStyle = '#FFFFFF';
	ctx.font = `${10 * hpx}px PT-sans`;
	ctx.textAlign = 'center';
	ctx.fillText(mspt, W - 10 * hpx, H - 10 * hpx);

	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderBackground,
};