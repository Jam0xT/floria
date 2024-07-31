import { DynamicNumber } from '../../utility.js';
import * as canvas from '../../canvas.js';
import { getAssetByEntity } from '../../assets.js';

/*

entityAnimations {
	uuid0 {
		animationType0: alpha0(DynamicNumber)
		animationType1: alpha1(DynamicNumber)
		...
	}
	uuid1 {
		animationType0: alpha0(DynamicNumber)
		animationType1: alpha1(DynamicNumber)
		...
	}
	...
}

*/

let entitiesAnimations = {} // ^^^

let tempEntitiesAnimations = {}; // 每次渲染都会替换原本的动画列表

let entitiesAnimationsCtx; // 实体动画将绘制在此ctx上

const animationColors = {
	hurt: `rgb(255, 0, 0)`,
	poison: `rgb(83, 2, 118)`,
	heal_res: `rgb(255, 255, 255)`,
}

const animationDynnums = {
	hurt: function () {
		return DynamicNumber.create(1, 0, 20);
	},
	poison: function () {
		return DynamicNumber.create(0.8, 0, 40, `exp`, 0.9); 
	},
	heal_res: function () {
		return DynamicNumber.create(0.8, 0, 40, `exp`, 0.9);
	},
}

function addEntityAnimation(entity, type) { // 增加实体动画
	if (!entitiesAnimations[entity.uuid]) entitiesAnimations[entity.uuid] = {};
	entitiesAnimations[entity.uuid][type] = animationDynnums[type]();
}

function loadEntitiesAnimationsCtx(ctx) { // 加载实体动画使用的ctx
	entitiesAnimationsCtx = ctx;
}

function updateEntityAnimations(self, entity) { // 更新实体动画
	const animations = entitiesAnimations[entity.uuid];
	if (!animations) return;
	
	Object.entries(animations).forEach(([type, Alpha]) => {
		if (Alpha.isDone) return;
		
		const ctx = entitiesAnimationsCtx;
		
		//设定动画颜色
		const color = animationColors[type] || `#1f1e33`; // 出现此颜色就代表代码有问题
		
		//设定透明度
		let alpha;
		if (entity.attr.ghost) {
			alpha = 0.2;
		} else {
			alpha = Alpha.get();
		};
		
		const asset = getAssetByEntity(entity);
		const canvasX = canvas.W / 2 + (entity.x - self.x) * canvas.hpx;
		const canvasY = canvas.H / 2 + (entity.y - self.y) * canvas.hpx;
		const renderRadius = entity.attr.radius * canvas.hpx;
		
		canvas.fillColorOnAsset(ctx, asset, color, alpha, canvasX, canvasY, entity.attr.dir, renderRadius);
	})
}

function recordNewEntitiesList(entity) { // 记录实体到临时列表
	if (!entitiesAnimations[entity.uuid]) return;
	tempEntitiesAnimations[entity.uuid] = entitiesAnimations[entity.uuid];
}

function setNewEntitiesList() { // 用临时列表替换旧列表
	entitiesAnimations = tempEntitiesAnimations;
	tempEntitiesAnimations = {}; // 这里实际是将临时动画列表指向了新的地址，因此不会影响主列表
}

function getEntitiesAnimationsCtx() {
	return entitiesAnimationsCtx;
}

export {
	addEntityAnimation,
	loadEntitiesAnimationsCtx,
	updateEntityAnimations,
	recordNewEntitiesList,
	setNewEntitiesList,
	getEntitiesAnimationsCtx,
}
