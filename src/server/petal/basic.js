const Petal = require('../petal');
const PetalAttributes = require('../../../public/petal_attributes');
const Attribute = PetalAttributes.BASIC;

class BasicPetal extends Petal {
	constructor(id, x, y, absoluteCenter, parent) {
		super(id, x, y, absoluteCenter, parent, 'BASIC', Attribute.MAX_HP, true);
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