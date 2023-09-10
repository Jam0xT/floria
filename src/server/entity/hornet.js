const Mob = require('../mob');

class Hornet extends Mob {
	constructor(id, x, y, team) {
		super(id, x, y, 'HORNET', team, false);
		this.sensitization = true;
		this.target = 0;
		this.maxCloseLength = 350;
		this.skillCoolDown = 2;
		this.aimMovementDirection = 1;
		this.isSkillenable = false;
		if (Math.random() <= 0.5) {
			this.aimMovementDirection = -1;
		}
	}

	updateMovement(deltaT,target) {
		if (!target) return;
		
		if (Math.sqrt((target.x - this.x) ** 2 + (target.y - this.y) ** 2) <= this.maxCloseLength) {
			let atan = Math.atan2(this.x - target.x, target.y - this.y) + this.aimMovementDirection;
			let goalPos = {
				x: target.x + this.maxCloseLength * Math.sin(atan),
				y: target.y - this.maxCloseLength * Math.cos(atan),
			};
			this.movement = {
				direction: Math.atan2(goalPos.x - this.x, this.y - goalPos.y),
				speed: this.attributes.SPEED / 5,
			};
			this.direction = Math.atan2(target.x - this.x, this.y - target.y);
			this.isSkillenable = true;
			return;
		}
		
		this.movement = {
			direction: Math.atan2(target.x - this.x, this.y - target.y),
			speed: this.attributes.SPEED,
		};
		this.direction = this.movement.direction;
		this.isSkillenable = false;
	}
}

module.exports = Hornet;