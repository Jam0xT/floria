import * as pixi from 'pixi.js';
import * as assets from '../assets.js';
import * as util from '../../../utility.js';

class Entity {
	// 是否活跃 活跃的充要条件是在视距范围内
	isActive = true;

	container = new pixi.Container();

	asset;

	dead = false;

	hurtTick = 999;

	hurtFilterAlpha = new util.DynamicNumber(0);

	hurtFilter = new pixi.ColorMatrixFilter();

	deathAlpha = new util.DynamicNumber(1, 1, 'exp', 0.7);

	deathScale = new util.DynamicNumber(1, 1, 'exp', 0.8);

	constructor(entity) {
		this.initAsset(entity);
		this.asset.filters = [this.hurtFilter];
	}

	// 初始化素材
	initAsset(entity) {
		let assetName;
		if ( entity.type == 'player' ) {
			assetName = 'player';
		} else if ( entity.type == 'petal' ) {
			assetName = `petal/${entity.id}`;
		} else if ( entity.type == 'mob' ) {
			assetName = `mob/${mob.id}`;
		}
		this.asset = assets.getAsset(assetName, entity.attr.radius);
		this.container.addChild(this.asset);
	}

	// ticker
	update() {
		if ( this.dead ) {
			this.asset.alpha = this.deathAlpha.get();
			this.asset.scale = this.deathScale.get();
			return ;
		}

		if ( this.hurtTick == 0 ) {
			this.hurtFilter.matrix = [
				1, 1, 1, 0, 0,
				1, 1, 1, 0, 0,
				1, 1, 1, 0, 0,
				0, 0, 0, 1, 0,
			];
			this.hurtFilter.alpha = 1;
		} else {
			if ( this.hurtTick == 1 ) {
				this.hurtFilter.matrix = [
					1, 1, 1, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 0, 0,
					0, 0, 0, 1, 0,
				];
				this.hurtFilterAlpha.set(1);
				this.hurtFilterAlpha.to(0);
			}
			this.hurtFilter.alpha = this.hurtFilterAlpha.get();
		}
		this.hurtTick ++;
	}

	// 更新数据
	updateState(entity) {
		this.updatePos(entity);
		if ( entity.isHurt ) {
			this.onHurt();
		}

		if ( entity.isDead ) {
			this.onDeath();
		}
	}

	updatePos(entity) {
		this.container.x = entity.x;
		this.container.y = entity.y;
	}

	// 受伤
	onHurt() {
		this.hurtTick = 0;
	}

	// 死亡
	onDeath() {
		this.deathAlpha.to(0);
		this.deathScale.to(2);
		this.dead = true;
	}

	// 加载
	load() {
		this.isActive = true;
		this.container.visible = true; // 显示
	}

	// 卸载
	unload() {
		this.isActive = false;
		this.container.visible = false; // 隐藏
	}
}

export default Entity;