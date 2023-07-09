const Petal = require('../petal');

class BasicPetal extends Petal {
	constructor(id, x, y, parent) {
		super(id, x, y, parent, 'BASIC', true, false);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
		};
	}
}

module.exports = BasicPetal;