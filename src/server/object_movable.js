const Constants = require('../shared/constants');
const GameObject = require('./object');

class GameObjectMovable extends GameObject {
	constructor(id, x, y, hp, velocity) {
		super(id, x, y, hp);
		this.velocity = velocity;
	}

	update(deltaT) { // handle hurtTime, total		
		this.x += deltaT * this.velocity.x;
		this.y -= deltaT * this.velocity.y;

		if ( this.hurtTime > -1 ) {
			if ( this.hurtTime >= Constants.HURT_INTERVAL ) {
				this.hurtTime = -1;
			} else {
				this.hurtTime += (deltaT / (1 / Constants.TICK_PER_SECOND) );
			}
		}
	}

	serializeForUpdate() {
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			hurtTime: this.hurtTime,
		};
	}
}

module.exports = GameObjectMovable;