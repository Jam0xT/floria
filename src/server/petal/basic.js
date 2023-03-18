const Petal = require('../petal');
const PetalAttributes = require('../../../public/petal_attributes');
const Attribute = PetalAttributes.BASIC;

class BasicPetal extends Petal {
	constructor(id, x, y, parent) {
		super(id, x, y, parent, 'BASIC', Attribute.MAX_HP);
	}

	update(deltaT) {
		super.update(deltaT, Attribute);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
		};
	}
}

module.exports = BasicPetal;