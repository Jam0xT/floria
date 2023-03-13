const Entity = require('../entity');
const EntityAttributes = require('../../../public/entity_attributes');
const Attribute = EntityAttributes.BUBBLE;

class Bubble extends Entity {
	constructor(id, x, y, team) {
		super(id, x, y, team, 'BUBBLE', Attribute.MAX_HP, Attribute.MAX_HP);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
			activeDirection: this.activeDirection,
		}
	}
}

module.exports = Bubble;