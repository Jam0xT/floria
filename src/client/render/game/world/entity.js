import * as pixi from 'pixi.js';
import * as assets from '../assets.js';

class Entity {
	// 是否活跃 活跃的充要条件是在视距范围内
	isActive = true;

	container = new pixi.Container();

	asset;

	constructor(entity) {
		this.initAsset(entity);
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
		this.asset = assets.getAsset(assetName);
		this.asset.scale = 2 * entity.attr.radius / this.asset.width;
		this.container.addChild(this.asset);
	}

	// 更新数据
	update(entity) {
		this.updatePos(entity);
	}

	updatePos(entity) {
		this.container.x = entity.x;
		this.container.y = entity.y;
	}

	// 受伤
	onHurt() {

	}

	// 死亡
	onDeath() {
		
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