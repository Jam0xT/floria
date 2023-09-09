const Mob = require('../mob');

class Hornet extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'HORNET', team, false);
		this.sensitization = true;
		this.target = 0;
	}

	updateMovement(deltaT,target) {
		if (target) {
			this.movement = {
				direction: Math.atan2(target.x - this.x, this.y - target.y),
				speed: this.attributes.SPEED,
			};
		}
	}
}

module.exports = Hornet;