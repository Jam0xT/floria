const Constants = require('../shared/constants');

class Entity {
	constructor(id, x, y, team, generalType, type, hp, maxHp, noBorderCollision, friendlyCollisions) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.team = team;
		this.generalType = generalType;
		this.type = type;
		this.hp = hp;
		this.maxHp = maxHp;
		this.hurtByInfo = {
			type: -1,
			id: -1,
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.constraintVelocity = {
			x: 0,
			y: 0,
		}
		this.chunks = [];
		this.noBorderCollision = noBorderCollision;
		this.friendlyCollisions = friendlyCollisions;
		this.movement = {
			direction: 0,
			speed: 0,
		};
	}

	distanceTo(object) {
		const deltaX = this.x - object.x;
		const deltaY = this.y - object.y;
		return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	}
	
	handleBorder(objectRadius) {
		if ( this.x < objectRadius ){ // hit left border
			this.velocity.x = 0;
			this.x = objectRadius;
		} else if ( this.x > Constants.MAP_WIDTH - objectRadius ) { // hit right border
			this.velocity.x = 0;
			this.x = Constants.MAP_WIDTH - objectRadius;
		}
		if ( this.y < objectRadius ){ // hit top border
			this.velocity.y = 0;
			this.y = objectRadius;
		} else if ( this.y > Constants.MAP_HEIGHT - objectRadius ) { // hit bottom border
			this.velocity.y = 0;
			this.y = Constants.MAP_HEIGHT - objectRadius;
		}
	}

	updateVelocity(deltaT) {
		this.velocity.x *= Constants.SPEED_ATTENUATION_COEFFICIENT;
		this.velocity.y *= Constants.SPEED_ATTENUATION_COEFFICIENT;
		const speedX = this.movement.speed * deltaT * 20 * Math.sin(this.movement.direction);
		const speedY = this.movement.speed * deltaT * 20 * Math.cos(this.movement.direction);
		this.velocity.x += speedX;
		this.velocity.y += speedY;
	}

	applyVelocity(deltaT) {		
		this.x += deltaT * this.velocity.x;
		this.y -= deltaT * this.velocity.y;
	}

	applyConstraintVelocity(deltaT) {
		this.x += this.constraintVelocity.x * deltaT;
		this.y -= this.constraintVelocity.y * deltaT;
		this.velocity.x += this.constraintVelocity.x;
		this.velocity.y += this.constraintVelocity.y;
		this.constraintVelocity = {
			x: 0,
			y: 0,
		};
	}

	updateChunks(attribute) {
		const chunksNew = [];

		const chunkRadius = Math.ceil(attribute.RADIUS / Constants.CHUNK_SIZE + 1);

		const baseChunk = {
			x: Math.floor(this.x / Constants.CHUNK_SIZE),
			y: Math.floor(this.y / Constants.CHUNK_SIZE),
		}

		var chunkX = baseChunk.x - chunkRadius, chunkY = baseChunk.y - chunkRadius;

		while ( chunkX <= baseChunk.x + chunkRadius && chunkY <= baseChunk.y + chunkRadius ) {
			if ( chunkX < baseChunk.x + chunkRadius ) {
				chunkX ++;
			} else if ( chunkY < baseChunk.y + chunkRadius ) {
				chunkX = baseChunk.x - chunkRadius;
				chunkY ++;
			} else {
				break;
			}
			if( chunkX < 0 || chunkY < 0 )
				continue;
			if ( chunkX == baseChunk.x ) {
				if ( chunkY > baseChunk.y ) {
					if ( chunkY * Constants.CHUNK_SIZE <= this.y + attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				} else {
					if ( (chunkY + 1) * Constants.CHUNK_SIZE >= this.y - attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				}
			} else if ( chunkY == baseChunk.y ) {
				if ( chunkX > baseChunk.x ) {
					if ( chunkX * Constants.CHUNK_SIZE <= this.x + attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				} else if ( chunkX < baseChunk.x ){
					if ( (chunkX + 1) * Constants.CHUNK_SIZE >= this.x - attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				}
			} else {
				if ( chunkX > baseChunk.x && chunkY > baseChunk.y ) {
					const deltaX = chunkX * Constants.CHUNK_SIZE - this.x;
					const deltaY = chunkY * Constants.CHUNK_SIZE - this.y;
					if ( Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				} else if ( chunkX > baseChunk.x && chunkY < baseChunk.y ) {
					const deltaX = chunkX * Constants.CHUNK_SIZE - this.x;
					const deltaY = (chunkY + 1) * Constants.CHUNK_SIZE - this.y;
					if ( Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				} else if ( chunkX < baseChunk.x && chunkY > baseChunk.y ) {
					const deltaX = (chunkX + 1) * Constants.CHUNK_SIZE - this.x;
					const deltaY = chunkY * Constants.CHUNK_SIZE - this.y;
					if ( Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				} else {
					const deltaX = (chunkX + 1) * Constants.CHUNK_SIZE - this.x;
					const deltaY = (chunkY + 1) * Constants.CHUNK_SIZE - this.y;
					if ( Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= attribute.RADIUS ) {
						chunksNew.push({x: chunkX, y: chunkY});
					}
				}
			}
		}
		if ( this.isSameArray(chunksNew, this.chunks) ) {
			return false;
		} else {
			const chunksOld = [];
			this.chunks.forEach(chunkOld => {
				chunksOld.push(chunkOld);
			});
			this.chunks = [];
			chunksNew.forEach(chunkNew => {
				this.chunks.push(chunkNew);
			});
			return {
				chunksOld: chunksOld, 
				chunksNew: chunksNew,
			};
		}
	}

	isSameArray(array1, array2) {
		if ( array1.length != array2.length ) {
			return false;
		} else {
			for (let i = 0; i < array1.length; i++) {
				if ( array1[i] != array2[i] )
					return false;
			}
			return true;
		}
	}
	
	// handlePassiveMotion(passiveMotion) { // handls passive motion
	// 	const direction = passiveMotion.direction;
	// 	const magnitude = passiveMotion.magnitude;
		
	// 	const magnitudeX = magnitude * Math.sin(direction);
	// 	const magnitudeY = magnitude * Math.cos(direction);

	// 	this.passiveVelocity.push({
	// 		x: magnitudeX,
	// 		y: magnitudeY,
	// 	});
	// }

	serializeForUpdate() { // get necessary data and send to client
		return {
			id: this.id,
			x: this.x,
			y: this.y,
			chunks: this.getChunksForUpdate(),
			hp: this.hp,
		};
	}

	getChunksForUpdate() {
		var chunksForUpdate = [];
		this.chunks.forEach(chunk => {
			chunksForUpdate.push({
				x: chunk.x,
				y: chunk.y,
			});
		});
		return chunksForUpdate;
	}
}

module.exports = Entity;