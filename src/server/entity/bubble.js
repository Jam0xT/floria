const Mob = require('../mob');
const EntityAttributes = require('../../../public/entity_attributes');
const Attribute = EntityAttributes.BUBBLE;

class Bubble extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'BUBBLE', team, false)
	}
}

module.exports = Bubble;