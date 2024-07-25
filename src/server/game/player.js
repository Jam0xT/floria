import Entity from './entity.js';

class Player extends Entity {
	constructor(socketID, username, x, y, team, attr, defaultPetals ) {
		super('player', x, y, team, attr);
		const $ = this.var;
		$.playerInfo = { // 玩家信息
			socketID: socketID, // socket ID
			username: username, // 用户名
		};
		$.spec = false; // 是否为观察者
	}

	setSpec(state) { // 设置是否为观察者
		const $ = this.var;
		$.spec = state;
		$.attr.ghost = true;
	}
}

export default Player;