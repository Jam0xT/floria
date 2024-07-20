function renderBackground(x, y) {
	ctx = getCtx(backgroundLayer[0]);
	
	const gridInterval = hpx * 50;
	
	const startX = ( W / 2 - x * hpx ) % gridInterval;
	const startY = ( H / 2 - y * hpx ) % gridInterval;
	
	const gridLineWidth = hpx * 0.5;

	Object.values(Constants.MAP_AREAS).forEach((attribute, count, maps) => {
		if (count == 0) {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(0, 0, W, H);
		} else if (count == maps.length - 1) {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, 0, W * 5, H);
		} else {
			ctx.fillStyle = attribute.BACKGROUND_COLOR_DARKEN;
			ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, 0, attribute.WIDTH * hpx, H);
		}
		ctx.fillStyle = attribute.BACKGROUND_COLOR;
		ctx.fillRect(W / 2 - x * hpx + attribute.START_WIDTH * hpx, H / 2 - y * hpx, attribute.WIDTH * hpx, attribute.HEIGHT * hpx);
	})

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
}