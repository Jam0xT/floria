const Constants = require('../shared/constants');

class GameObject {
	constructor(id, x, y, hp, maxHp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.hp = hp;
		this.maxHp = maxHp;
		this.hurtTime = -1;
		this.hurtBy = -1;
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.activeDirection = 0;
		this.activeMotionMagnitude = {
			x: 0,
			y: 0,
		};
		this.activeVelocity = {
			x: 0,
			y: 0,
		};
		this.activeAcceleration = {
			x: 0,
			y: 0,
		};
		this.passiveVelocity = [];
	}

	distanceTo(object) {
		const deltaX = this.x - object.x;
		const deltaY = this.y - object.y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	
	handleBorder(objectRadius) {
		if ( this.x < objectRadius ){ // hit left border
			this.x = objectRadius;
			this.velocity.x = 0;
		} else if ( this.x > Constants.MAP_WIDTH - objectRadius ) { // hit right border
			this.x = Constants.MAP_WIDTH - objectRadius;
			this.velocity.x = 0;
		}

		if ( this.y < objectRadius ){ // hit top border
			this.y = objectRadius
			this.velocity.y = 0;
		} else if ( this.y > Constants.MAP_HEIGHT - objectRadius ) { // hit bottom border
			this.y = Constants.MAP_HEIGHT - objectRadius;
			this.velocity.y = 0;
		}
	}

	update(deltaT, attribute) {
		this.x += deltaT * this.velocity.x;
		this.y -= deltaT * this.velocity.y;

		if ( this.hurtTime > -1 ) {
			if ( this.hurtTime >= Constants.HURT_INTERVAL ) {
				this.hurtTime = -1;
			} else {
				this.hurtTime += (deltaT / (1 / Constants.TICK_PER_SECOND) );
			}
		}

		this.activeVelocity.x += this.activeAcceleration.x * deltaT;
		this.activeVelocity.y += this.activeAcceleration.y * deltaT;

		var activeVelocityX = this.activeVelocity.x;
		var activeVelocityY = this.activeVelocity.y;

		if ( Math.abs(activeVelocityX) > Math.abs(this.activeMotionMagnitude.x) ) {
			if ( Math.abs(activeVelocityX) * Constants.SPEED_ATTENUATION_COEFFICIENT <= Math.abs(this.activeMotionMagnitude.x) ) {
				activeVelocityX = this.activeMotionMagnitude.x;
			} else {
				activeVelocityX *= Constants.SPEED_ATTENUATION_COEFFICIENT;
			}
			this.activeVelocity.x = activeVelocityX;
		}

		if ( Math.abs(activeVelocityY) > Math.abs(this.activeMotionMagnitude.y) ) {
			if ( Math.abs(activeVelocityY) * Constants.SPEED_ATTENUATION_COEFFICIENT <= Math.abs(this.activeMotionMagnitude.y) ) {
				activeVelocityY = this.activeMotionMagnitude.y;
			} else {
				activeVelocityY *= Constants.SPEED_ATTENUATION_COEFFICIENT;
			}
			this.activeVelocity.y = activeVelocityY;
		}

		for( let i = 0; i < this.passiveVelocity.length; i ++) {
			const velocity = this.passiveVelocity[i];
			const velocityX = velocity.x;
			const velocityY = velocity.y;
			var magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
			const direction = Math.atan2(velocityX, velocityY);

			if ( magnitude * Constants.SPEED_ATTENUATION_COEFFICIENT <= Constants.SPEED_ATTENUATION_BIAS) {
				this.passiveVelocity.splice(i, 1);
				i --;
			} else {
				magnitude *= Constants.SPEED_ATTENUATION_COEFFICIENT;
				this.passiveVelocity[i] = {
					x: magnitude * Math.sin(direction),
					y: magnitude * Math.cos(direction),
				};
			}
		}

		this.velocity = {
			x: 0,
			y: 0,
		};

		this.passiveVelocity.forEach(velocity => {
			this.velocity.x += velocity.x;
			this.velocity.y += velocity.y;
		});

		this.velocity.x += this.activeVelocity.x;
		this.velocity.y += this.activeVelocity.y;

		this.handleBorder(attribute.RADIUS);
	}
	
	getAccelerationMagnitude(magnitude, entityMass) {
		const accelerationMagnitude = magnitude * entityMass;
		return accelerationMagnitude;
	}

	handlePassiveMotion(passiveMotion) {
		const direction = passiveMotion.direction;
		const magnitude = passiveMotion.magnitude;
		
		const magnitudeX = magnitude * Math.sin(direction);
		const magnitudeY = magnitude * Math.cos(direction);

		this.passiveVelocity.push({
			x: magnitudeX,
			y: magnitudeY,
		});
	}

	handleActiveMotion(activeMotion, entityMass) {
		const direction = activeMotion.direction;
		const magnitude = activeMotion.magnitude;

		this.activeMotionMagnitude = {
			x: magnitude * Math.sin(direction),
			y: magnitude * Math.cos(direction),
		};
		this.activeDirection = direction;

		const accelerationMagnitude = this.getAccelerationMagnitude(magnitude, entityMass);

		const accelerationMagnitudeX = accelerationMagnitude * Math.sin(direction);
		const accelerationMagnitudeY = accelerationMagnitude * Math.cos(direction);

		this.activeAcceleration = {
			x: accelerationMagnitudeX,
			y: accelerationMagnitudeY,
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

module.exports = GameObject;