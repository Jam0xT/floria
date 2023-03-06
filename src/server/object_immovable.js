const Constants = require('../shared/constants');
const GameObject = require('./object');

class GameObjectImmovable extends GameObject {
	constructor(id, x, y, hp) {
		super(id, x, y, hp);
	}
}

module.exports = GameObjectImmovable;