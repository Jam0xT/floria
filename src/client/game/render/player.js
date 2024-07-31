import { W, H, hpx } from '../../canvas.js';
import * as canvas from '../../canvas.js';
import { getAssetByEntity } from '../../assets.js';
import * as entityAnim from './entityAnimation.js';

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

	const { x, y } = player;
	const asset = getAssetByEntity(player);
	const canvasX = W / 2 + (x - self.x) * hpx;
	const canvasY = H / 2 + (y - self.y) * hpx;
	const renderRadius = player.attr.radius * hpx;

	ctx.save();
	(() => {
		

		// 玩家本体
		(() => {
			updateAnimation(self, player)
		
			// 如果玩家是 ghost 状态，设置本体透明度
			if ( player.attr.ghost ) 
				ctx.globalAlpha = 0.2;
		
			canvas.drawImage(ctx, asset, canvasX, canvasY, player.attr.dir, renderRadius);
			
			ctx.globalAlpha = 1;
		})();
		
		ctx.translate(canvasX, canvasY);

		// 玩家用户名
		ctx.save();
		(() => {
			if ( player.attr.ghost ) { // ghost 状态 用户名半透明
				ctx.globalAlpha = 0.5;
			}
		
			ctx.fillStyle = teamColor[player.team];
			ctx.font = `${20 * hpx}px PT-sans`;
			ctx.textAlign = 'center';
			ctx.fillText(player.username, 0, -player.attr.radius * 1.25 * hpx);
		})();
		ctx.restore();
	
		if ( !player.attr.ghost ) { // ghost 状态不显示血条
			healthBar(ctx, player);
		}
	})();

	ctx.restore();
}

function healthBar(ctx, player) { // 渲染血条
	
	// 玩家半径（用于决定血条长度）
	const renderRadius = player.attr.radius * hpx;

	// 底色
	const baseWidth = (renderRadius * 0.5) * hpx;
	const baseStyle = 'rgb(51, 51, 51)';
	const baseLength = (renderRadius * 2 + 20) * hpx;

	// 血条
	const outline = hpx * 3;
	const width = baseWidth - outline;
	const styleNormal = 'rgb(117, 221, 52)';
	const styleHurt = 'rgb(221, 52, 52)';
	const length = baseLength * Math.max(0, player.attr.hp) / player.attr.max_hp ;

	ctx.beginPath();
	ctx.lineWidth = baseWidth;
	ctx.moveTo(-baseLength / 2, hpx * 45);
	ctx.lineTo(+baseLength / 2, hpx * 45);
	ctx.strokeStyle = baseStyle;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();

	ctx.beginPath();
	ctx.lineWidth = width;
	ctx.moveTo(-baseLength / 2, hpx * 45);
	ctx.lineTo(-baseLength / 2 + length, hpx * 45);
	ctx.strokeStyle = styleNormal;
	ctx.lineCap = 'round';
	ctx.stroke();
	ctx.closePath();
}

function updateAnimation(self, player) { // 更新动画
	if (player.isHurt) {
		entityAnim.addEntityAnimation(player, `hurt`);
	} else if (player.effects.poison.duration > 0) {
		entityAnim.addEntityAnimation(player, `poison`);
	} else if (player.effects.heal_res.duration > 0) {
		entityAnim.addEntityAnimation(player, `heal_res`);
	}
	entityAnim.updateEntityAnimations(self, player);
}

export {
	renderPlayer,
};