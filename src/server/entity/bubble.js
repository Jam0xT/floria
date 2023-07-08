const Mob = require('../mob');

class Bubble extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'BUBBLE', team, false, true)
	}

	updateMovement(deltaT) {
		// no need to move
	}
}

module.exports = Bubble;