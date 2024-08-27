import * as pixi from 'pixi.js';

class Entity {
	// 是否活跃 活跃的充要条件是在视距范围内
	isActive = true;

	container = new pixi.Container();

	constructor() {}

	// 更新数据
	update(entity) {
		
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