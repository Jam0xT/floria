const Constants = require('../shared/constants');
const Entity = require('./entity');
const PetalAttributes = require('../../public/petal_attributes');

class Petal extends Entity {
	constructor(id, x, y, parent, type, noBorderCollision, friendlyCollisions) {
		super(id, x, y, parent, 'petal', type, PetalAttributes[type].MAX_HP, PetalAttributes[type].MAX_HP, noBorderCollision, friendlyCollisions);
		this.parent = parent;
		this.attributes = PetalAttributes[type];
		this.cooldown = 0;
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
		};
	}
}

module.exports = Petal;