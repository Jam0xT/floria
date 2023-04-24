const Constants = require('../shared/constants');

class Entity {
	constructor(id, x, y, team, generalType, type, hp, maxHp, noBorderCollision) {
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
		this.v = {
			x: 0,
			y: 0,
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.passiveVelocity = [];
		this.chunks = [];
		this.noBorderCollision = noBorderCollision;
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


		this.passiveVelocity.forEach(velocity => {
			this.velocity.x += velocity.x;
			this.velocity.y += velocity.y;
		});

		this.v = this.velocity;

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

	applyVelocity(deltaT, radius) {		
		this.x += deltaT * this.velocity.x;
		this.y -= deltaT * this.velocity.y;

		if ( this.noBorderCollision == false ) {
			this.handleBorder(radius);
		}
		
		this.velocity = {
			x: 0,
			y: 0,
		};
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
		var chunksForUpdate = '[';
		this.chunks.forEach(chunk => {
			chunksForUpdate += `{x: ${chunk.x}, y: ${chunk.y}},`
		});
		chunksForUpdate += ']';
		return chunksForUpdate;
	}
}

module.exports = Entity;