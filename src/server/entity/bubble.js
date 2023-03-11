const Entity = require('../entity');
const EntityAttributes = require('../../../public/entity_attributes');
const Attribute = EntityAttributes.BUBBLE;

class Bubble extends Entity {
	constructor(id, x, y) {
		super(id, x, y, Attribute.MAX_HP, Attribute.MAX_HP);
	}
}

module.exports = Bubble;