const Entity = require('./entity');

class Petal extends Entity {
	constructor(id, x, y, parent, maxHp) {
		super(id, x, y, maxHp, maxHp);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
		};
	}
}

module.exports = Petal;