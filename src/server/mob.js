const Entity = require('./entity');
const EntityAttributes = require('../../public/entity_attributes');

class Mob extends Entity {
	constructor(id, x, y, type, team) {
		super(id, x, y, team, 'mob', type, EntityAttributes[type].MAX_HP, EntityAttributes[type].MAX_HP)
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