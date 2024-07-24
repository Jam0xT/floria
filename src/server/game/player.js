import Entity from './entity.js';

class Player extends Entity {
	constructor(socketID, username, x, y, team, attr, defaultPetals ) {
		super('player', x, y, team, attr);
		const $ = this.var;
		$.playerInfo = { // 玩家信息
			socketID: socketID, // socket ID
			username: username, // 用户名
		};
		$.petalInfo = defaultPetals; // 花瓣信息
		$.petals = { // 花瓣 uuid
			primary: [],
			secondary: [],
		};
	}
}

export default Player;