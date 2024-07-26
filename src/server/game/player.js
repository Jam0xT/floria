import Entity from './entity.js';

class Player extends Entity {
	constructor(socketID, username, x, y, team, attr ) {
		super('player', x, y, team, attr);
		const $ = this.var;
		$.playerInfo = { // 玩家信息
			socketID: socketID, // socket ID
			username: username, // 用户名
		};
		$.spec = false; // 是否为观察者
		$.state = 0; // 0:无
	}

	setSpec(state) { // 设置是否为观察者
		const $ = this.var;
		$.spec = state;
		$.attr.ghost = true;
		$.attr.invulnerable = true;
	}
}

export default Player;