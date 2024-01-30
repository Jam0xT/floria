const Mob = require('../mob');

class Missile extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'MISSILE', team, true)
		this.existTime = 3.5;
	}

	updateMovement(deltaT) {
		// no need to move by itself
	}
}

module.exports = Missile;