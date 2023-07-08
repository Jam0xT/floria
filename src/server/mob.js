const Entity = require('./entity');
const EntityAttributes = require('../../public/entity_attributes');

class Mob extends Entity {
	constructor(id, x, y, type, team, noBorderCollision, friendlyCollisions) {
		super(id, x, y, team, 'mob', type, EntityAttributes[type].MAX_HP, EntityAttributes[type].MAX_HP, noBorderCollision, friendlyCollisions)
		this.attributes = EntityAttributes[type];
	}
	
	updateChunks() {
		return super.updateChunks(this.attributes);
	}
	
	handleBorder() {
		super.handleBorder(this.attributes.RADIUS);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
			activeDirection: this.activeDirection,
		}
	}
}

module.exports = Mob;