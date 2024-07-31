import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAsset } from '../../assets.js';
import { vision } from '../main.js';

const teamColor = [
	'#ff9c9c',
	'#a1d0ff',
	'#fff7a1',
	'#aaffa1',
	'#b3ffe2',
	'#ffbfea',
	'#f3bfff',
	'#ffc799',
];

function renderPlayer(ctx, self, player) {
	let u = hpx / vision;

	const { x, y } = player;
	let asset;
	if ( player.username == "Pop!") {
		asset = getAsset('mobs/bubble.svg');
	} else {
		asset = getAsset('player.svg');
	}
	const width = asset.naturalWidth, height = asset.naturalHeight;
	const canvasX = W / 2 + (x - self.x) * u;
	const canvasY = H / 2 + (y - self.y) * u;
	const renderRadius = player.attr.radius * u;

	ctx.save();
	(() => {
		ctx.translate(canvasX, canvasY);

		// 玩家本体
		ctx.save();
		(() => {
			ctx.rotate(player.attr.dir);
		
			// 如果玩家是 ghost 状态，设置本体透明度
			if ( player.attr.ghost ) 
				ctx.globalAlpha = 0.2;
		
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
		})();
		ctx.restore();

		// 玩家用户名
		ctx.save();
		(() => {
			if ( player.attr.ghost ) { // ghost 状态 用户名半透明
				ctx.globalAlpha = 0.5;
			}
		
			ctx.fillStyle = teamColor[player.team];
			ctx.font = `${20 * u}px PT-sans`;
			ctx.textAlign = 'center';
			ctx.fillText(player.username, 0, -player.attr.radius * 1.25 * u);
		})();
		ctx.restore();
	
		if ( !player.attr.ghost ) { // ghost 状态不显示血条
			healthBar(ctx, player);
		}
	})();

	ctx.restore();
}

function healthBar(ctx, player) { // 渲染血条
	let u = hpx / vision;
	
	// 玩家半径（用于决定血条长度）
	const renderRadius = player.attr.radius * u;

	// 底色
	const baseWidth = (renderRadius * 0.5) * u;
	const baseStyle = 'rgb(51, 51, 51)';
	const baseLength = (renderRadius * 2 + 20) * u;

	// 血条
	const outline = u * 3;
	const width = baseWidth - outline;
	const styleNormal = 'rgb(117, 221, 52)';
	const styleHurt = 'rgb(221, 52, 52)';
	const length = baseLength * Math.max(0, player.attr.hp) / player.attr.max_hp ;

	ctx.beginPath();
	ctx.lineWidth = baseWidth;
	ctx.moveTo(-baseLength / 2, u * 45);
	ctx.lineTo(+baseLength / 2, u * 45);
	ctx.strokeStyle = baseStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.moveTo(-baseLength / 2, u * 45);
	ctx.lineTo(-baseLength / 2 + length, u * 45);
	ctx.strokeStyle = styleNormal;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();
}

export {
	renderPlayer,
};