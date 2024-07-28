import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAsset } from '../../assets.js';

function renderPlayer(self, player) {
	// const ctx = canvas.getTmpCtx();
	const ctx = canvas.ctxMain;

	const { x, y } = player;
	let playerAsset;
	if ( player.username == "Pop!") {
		playerAsset = getAsset('mobs/bubble.svg');
	} else {
		playerAsset = getAsset('player.svg');
	}
	const canvasX = W / 2 + (x - self.x) * hpx;
	const canvasY = H / 2 + (y - self.y) * hpx;
	const renderRadius = player.attr.radius * hpx;
	ctx.translate(canvasX, canvasY);

	if ( player.attr.ghost )
		ctx.globalAlpha = 0.2;
	
	ctx.drawImage(
		playerAsset,
		- renderRadius,
		- renderRadius,
		renderRadius * 2,
		renderRadius * 2,
	);
	
	const teamColor = [
		'#ff9c9c',
		'#a1d0ff',
		'#fff7a1',
		'#aaffa1',
	];


	ctx.fillStyle = teamColor[player.team];
	ctx.font = `${20 * hpx}px PT-sans`;
	ctx.textAlign = 'center';
	ctx.fillText(player.username, 0, -25 * hpx);

	if ( player.attr.ghost )
		ctx.globalAlpha = 1;

	ctx.translate(-canvasX, -canvasY);

	// render health bar
	const healthBarBaseWidth = hpx * 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = renderRadius * 2 + hpx * 20;

	const healthBarOutline = hpx * 3;
	const healthBarWidth = healthBarBaseWidth - healthBarOutline;
	const healthBarStyleNormal = 'rgb(117, 221, 52)';
	const healthBarStyleHurt = 'rgb(221, 52, 52)';
	const healthBarLength = healthBarBaseLength * Math.max(0, player.attr.hp) / player.attr.max_hp ;

	ctx.beginPath();
	ctx.lineWidth = healthBarBaseWidth;
	ctx.moveTo(canvasX - healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.lineTo(canvasX + healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.strokeStyle = healthBarBaseStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.lineWidth = healthBarWidth;
	ctx.moveTo(canvasX - healthBarBaseLength / 2, canvasY + hpx * 45);
	ctx.lineTo(canvasX - healthBarBaseLength / 2 + healthBarLength, canvasY + hpx * 45);
	ctx.strokeStyle = healthBarStyleNormal;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	// canvas.draw(ctx, canvas.ctxMain);
}

export {
	renderPlayer,
};