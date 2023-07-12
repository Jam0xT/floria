const Constants = require('../shared/constants');
const Entity = require('./entity');
const PetalAttributes = require('../../public/petal_attributes');

class Petal extends Entity {
	constructor(id, x, y, parent, type, noBorderCollision) {
		super(id, x, y, parent, 'petal', type, PetalAttributes[type].MAX_HP, PetalAttributes[type].MAX_HP, noBorderCollision);
		this.parent = parent;
		this.attributes = PetalAttributes[type];
		this.cooldown = 0;
		this.action = false;
		this.actionTime = 0;
		if ( this.attributes.TRIGGERS.ACTION_COOLDOWN ) {
			this.actionCooldown = this.attributes.TRIGGERS.ACTION_COOLDOWN;
		} else {
			this.actionCooldown = -1;
		}
		this.direction = 0;
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
			dir: this.direction,
		};
	}
}

module.exports = Petal;