import { play } from '../animation.js';
import * as util from '../utility.js';
import * as canvas from '../canvas.js';
import { getCurrentState } from '../state.js';
import { getAsset } from '../assets.js';

let ctx;

let W, H, hpx;

function startRenderGame() {
	ctx = canvas.ctxMain;
	W = canvas.W;
	H = canvas.H;
	hpx = H / 1000;
	play(render);
}

function render() {
	const state = getCurrentState();
	console.log(state);
	if ( state.me ) {
		renderBackground(state.me.x, state.me.y);
		renderPlayer(state.me, state.me);
		state.others.forEach(renderPlayer.bind(null, state.me));
	}
}

function renderBackground(x, y) {
	const gridInterval = hpx * 50;
	
	const startX = ( W / 2 - x * hpx ) % gridInterval;
	const startY = ( H / 2 - y * hpx ) % gridInterval;
	
	const gridLineWidth = hpx * 0.5;

	ctx.fillStyle = `rgb(28, 154, 89)`;
	ctx.fillRect(0, 0, W, H);
	ctx.fillStyle = `rgb(30, 167, 97)`;
	ctx.fillRect(W / 2 - x * hpx, H / 2 - y * hpx, 4000 * hpx, 4000 * hpx)

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

function renderPlayer(me, player) {
	const { x, y } = player;
	let playerAsset;
	if ( player.username == "Pop!") {
		playerAsset = getAsset('mobs/bubble.svg');
	} else {
		playerAsset = getAsset('player.svg');
	}
	const canvasX = W / 2 + (x - me.x) * hpx;
	const canvasY = H / 2 + (y - me.y) * hpx;
	const renderRadius = player.size * hpx;
	ctx.translate(canvasX, canvasY);

	ctx.drawImage(
		playerAsset,
		- renderRadius,
		- renderRadius,
		renderRadius * 2,
		renderRadius * 2,
	);
	
	const hitboxRadius = player.radius * hpx;

	// if ( debugOptions[0] ) {
	// 	renderHitbox(hitboxRadius);
	// }
	
	// if ( debugOptions[1] ) {
	// 	renderText(1, `hp:${player.hp.toFixed(1)}`, 0, hpx * 25, hpx * 18, 'center');
	// }

	// if ( debugOptions[2] ) {
	// 	ctx.beginPath();
	// 	ctx.moveTo(0, 0);
	// 	ctx.lineTo(hitboxRadius * Math.sin(player.dir), -hitboxRadius * Math.cos(player.dir));
	// 	ctx.closePath();
	// 	ctx.strokeStyle = '#fc0f5e';
	// 	ctx.lineWidth = hpx * 1;
	// 	ctx.stroke();
	// }

	ctx.translate(-canvasX, -canvasY);

	// ctx = getCtx(backgroundLayer[0]);

	// render username
	// util.renderText(1, player.username, canvasX, canvasY - hpx * 35, hpx * 20, 'center');

	// render health bar
	const healthBarBaseWidth = hpx * 10;
	const healthBarBaseStyle = 'rgb(51, 51, 51)';
	const healthBarBaseLength = renderRadius * 2 + hpx * 20;

	const healthBarOutline = hpx * 3;
	const healthBarWidth = healthBarBaseWidth - healthBarOutline;
	const healthBarStyleNormal = 'rgb(117, 221, 52)';
	const healthBarStyleHurt = 'rgb(221, 52, 52)';
	const healthBarLength = healthBarBaseLength * player.hp / player.maxHp ;

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

	// render petals
	// ctx = getCtx(petalLayer[0]);

	player.petals.forEach(petal => {
		if (petal.isHide) return;
		
		const renderRadius = petal.size * hpx;
		const asset = getAsset(`petals/${petal.type.toLowerCase()}.svg`);
		const width = asset.naturalWidth, height = asset.naturalHeight;

		ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);
		ctx.rotate(petal.dir);
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
		ctx.rotate(-petal.dir);
		ctx.translate(-(canvasX + (petal.x - player.x) * hpx), -(canvasY + (petal.y - player.y) * hpx));
		// ctx = getCtx(petalLayer[1]);
		ctx.translate(canvasX + (petal.x - player.x) * hpx, canvasY + (petal.y - player.y) * hpx);

		// const petalHitboxRadius = petal.radius * hpx;

		// if ( debugOptions[0] ) {
		// 	renderHitbox(petalHitboxRadius);
		// }

		// if ( debugOptions[1] ) {
		// 	renderText(1, `hp:${petal.hp.toFixed(1)}`, 0, hpx * 25, hpx * 18, 'center');
		// }

		// if ( debugOptions[2] ) {
		// 	ctx.beginPath();
		// 	ctx.moveTo(0, 0);
		// 	ctx.lineTo(petalHitboxRadius * Math.sin(petal.dir), -petalHitboxRadius * Math.cos(petal.dir));
		// 	ctx.closePath();
		// 	ctx.strokeStyle = '#fc0f5e';
		// 	ctx.lineWidth = hpx * 1;
		// 	ctx.stroke();
		// }

		ctx.translate(-(canvasX + (petal.x - player.x) * hpx), -(canvasY + (petal.y - player.y) * hpx));
		// ctx = getCtx(petalLayer[0]);
	});
}

export {
	startRenderGame,
}