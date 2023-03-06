// const Constants = require('../shared/constants');

class GameObject {
	constructor(id, x, y, hp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
		this.hurtTime = -1;
	}

	distanceTo(object) {
		const deltaX = this.x - object.x;
		const deltaY = this.y - object.y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
}

module.exports = GameObject;