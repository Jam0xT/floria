const Constants = require('../shared/constants');

class Entity {
	constructor(id, x, y, team, type, hp, maxHp) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.team = team;
		this.type = type;
		this.hp = hp;
		this.maxHp = maxHp;
		this.hurtTime = -1;
		this.hurtByInfo = {
			type: -1,
			id: -1,
		};
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
		this.chunk = {
			x: -1,
			y: -1,
		};
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

	update(deltaT, attribute) { // called every tick in game.js
		this.x += deltaT * this.velocity.x;
		this.y -= deltaT * this.velocity.y;

		if ( this.hurtTime > -1 ) { // handle hurt interval
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

		const chunkNew = {
			x: Math.floor(this.x / Constants.CHUNK_SIZE),
			y: Math.floor(this.y / Constants.CHUNK_SIZE),
		};

		if ( chunkNew == this.chunk ) {
			return false;
		} else {
			const chunkOld = this.chunk;
			this.chunk = chunkNew;
			return {chunkOld, chunkNew};
		}
	}
	
	getAccelerationMagnitude(magnitude, entityMass) { // calculate the accelertion magnitude in this.handleActiveMotion
		const accelerationMagnitude = magnitude * entityMass;
		return accelerationMagnitude;
	}

	handlePassiveMotion(passiveMotion) { // handls passive motion
		const direction = passiveMotion.direction;
		const magnitude = passiveMotion.magnitude;
		
		const magnitudeX = magnitude * Math.sin(direction);
		const magnitudeY = magnitude * Math.cos(direction);

		this.passiveVelocity.push({
			x: magnitudeX,
			y: magnitudeY,
		});
	}

	handleActiveMotion(activeMotion, entityMass) { // handles active motion
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

	serializeForUpdate() { // get necessary data and send to client
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			hurtTime: this.hurtTime,
			chunk: this.chunk,
			hp: this.hp,
		};
	}
}

module.exports = Entity;