const Petal = require('../petal');

class BasicPetal extends Petal {
	constructor(id, x, y, absoluteCenter, parent) {
		super(id, x, y, absoluteCenter, parent, 'BASIC', true);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
		};
	}
}

module.exports = BasicPetal;