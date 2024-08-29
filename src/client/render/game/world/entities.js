import * as pixi from 'pixi.js';
import Entity from './entity.js';

class Entities {
	container = new pixi.Container();

	// 实体加载距离，超过加载距离的实体将不会收到更新，应当被卸载
	loadDistance = 0;

	entities = {};

	constructor() {}

	// 设置加载距离
	setLoadDistance(loadDistance) {
		this.loadDistance = loadDistance;
	}

	// ticker
	// x y 是自身坐标
	update(state, x, y) {
		const entities = state.entities;

		Object.keys(entities).forEach(uuid => { // 遍历
			// 获取服务器发送的该实体信息
			const entity = entities[uuid];
			if ( !this.entities[uuid] ) { // 该实体在客户端无记录
				// 创建新的客户端实体
				this.entities[uuid] = new Entity(entity);
				this.container.addChild(this.entities[uuid].container);
			}
			// 加载
			if ( !this.entities[uuid].isActive ) {
				this.entities[uuid].load();
			}
			this.entities[uuid].updateState(entity);
		});

		Object.keys(this.entities).forEach(uuid => {
			const entity = this.entities[uuid];
			entity.update();
			if ( entity.isActive && (!entities[uuid]) ) {
				entity.unload();
			}
		});
	}
}

export default Entities;