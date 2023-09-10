const Mob = require('../mob');

class Dark_ladybug extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'DARK_LADYBUG', team, false);
		this.target = 0;
	}

	updateMovement(deltaT,target) {
		//首次受到攻击时更改攻击目标
		if (!this.target && this.hurtByInfo.id.playerID) {
			this.target = this.hurtByInfo.id.playerID;
		}
		
		//拥有攻击目标则开始追杀
		if (target) {
			this.movement = {
				direction: Math.atan2(target.x - this.x, this.y - target.y),
				speed: this.attributes.SPEED,
			};
		}
	}
}

module.exports = Dark_ladybug;