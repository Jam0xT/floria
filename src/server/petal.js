const Entity = require('./entity');

class Petal extends Entity {
	constructor(id, x, y, parent, type, maxHp) {
		super(id, x, y, parent, 'petal', type, maxHp, maxHp);
		this.parent = parent;
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
		};
	}
}

module.exports = Petal;