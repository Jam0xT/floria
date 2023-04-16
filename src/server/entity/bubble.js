const Mob = require('../mob');

class Bubble extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'BUBBLE', team, false)
	}
}

module.exports = Bubble;