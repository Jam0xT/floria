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
	
	updateAnimation(self, petal)
	
	canvas.drawImage(ctx, asset, canvasX, canvasY, petal.attr.dir, renderRadius);
	
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

function updateAnimation(self, petal) { // 更新动画
	if (petal.isHurt) {
		entityAnim.addEntityAnimation(petal, `hurt`);
	} else if (petal.effects.poison.duration > 0) {
		entityAnim.addEntityAnimation(petal, `poison`);
	} else if (petal.effects.heal_res.duration > 0) {
		entityAnim.addEntityAnimation(petal, `heal_res`);
	}
	entityAnim.updateEntityAnimations(self, petal);
}

export {
	renderPetal,
};