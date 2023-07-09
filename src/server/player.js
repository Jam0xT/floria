const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;
const PetalBasic = require('./petal/basic');

class Player extends Entity {
	constructor(id, username, x, y) {
		super(id, x, y, id, 'mob', 'PLAYER', EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE, false, true);
		// a player's team equals to his id
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
		this.exp = 0;
		this.level = 1;
		this.currentExpForLevel = this.getExpForLevel(this.level);
		this.slotCount = Constants.SLOT_COUNT_BASE;
		this.petalCount = Constants.SLOT_COUNT_BASE; // petalCount <= slotCount
		this.petalObjectCount = Constants.SLOT_COUNT_BASE; // petalObjectCount doesn't always equal to petalCount because some petals have more than one object
		this.rotationSpeed = Constants.PETAL_ROTATION_SPEED_BASE;
		this.firstPetalDirection = 0;
		this.rotateClockwise = 1; // 1 for clockwise, -1 for counter-clockwise
		this.petalExpandRadius = 60;
		// this.petalExpandRadius = 120;
		this.petals = [
			new PetalBasic(0, x, y, id),
			new PetalBasic(1, x, y, id),
			new PetalBasic(2, x, y, id),
			new PetalBasic(3, x, y, id),
			new PetalBasic(4, x, y, id),
		];
		this.petalType = ['BASIC', 'BASIC', 'BASIC', 'BASIC', 'BASIC',];
		this.inCooldown = [false, false, false, false, false,];
		this.activeDirection = 0;
		this.attributes = Attribute;
	}

	updatePetalMovement(deltaT) {
		this.firstPetalDirection -= this.rotateClockwise * this.rotationSpeed * deltaT;
		if ( this.firstPetalDirection > 2 * Math.PI ) {
			this.firstPetalDirection -= 2 * Math.PI;
		}
		if ( this.firstPetalDirection < - 2 * Math.PI ) {
			this.firstPetalDirection += 2 * Math.PI;
		}
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				const theta = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
				const goalPos = {
					x: this.x + this.petalExpandRadius * Math.sin(theta),
					y: this.y + this.petalExpandRadius * Math.cos(theta),
				}
				petal.movement = {
					direction: Math.atan2(goalPos.x - petal.x, petal.y - goalPos.y),
					speed: Math.sqrt((goalPos.x - petal.x) ** 2 + (goalPos.y - petal.y) ** 2) * Constants.PETAL_FOLLOW_SPEED,
				}
			} else {
				this.petals[petalID] -= deltaT;
				if ( this.petals[petalID] <= 0 ) {
					this.inCooldown[petalID] = false;
					this.petals[petalID] = this.newPetal(this.petalType[petalID], petalID);
				}
			}
		}
	}

	newPetal(type, petalID) {
		if ( type == 'BASIC' ) {
			return new PetalBasic(petalID, this.x, this.y, this.id);
		}
	}

	handleActiveMovement(activeMovement) { // handles active motion
		this.movement = activeMovement;
		this.activeDirection = activeMovement.direction;
	}

	updateChunks() {
		return super.updateChunks(this.attributes.RADIUS);
	}
 
	updateMovement(deltaT) {
		this.updatePetalMovement(deltaT);
	}

	updateVelocity(deltaT) {
		super.updateVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				petal.updateVelocity(deltaT);
			}
		}
	}

	applyVelocity(deltaT) {
		super.applyVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				petal.applyVelocity(deltaT);
			}
		}
	}
	
	applyConstraintVelocity(deltaT) {
		super.applyConstraintVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				petal.applyConstraintVelocity(deltaT);
			}
		}
	}

	handleBorder() {
		super.handleBorder(this.attributes.RADIUS);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				petal.handleBorder(petal.attributes.RADIUS);
			}
		}
	}

	reload(petalID) {
		this.petals[petalID] = this.petals[petalID].attributes.RELOAD;
	}

	getExpForLevel(level) {
		const expCoeN = 10;
		const expCoeK = 5;
		const expCoeB = 1.08;
		// K * (B ^ L) + N
		return Math.floor(Math.pow(expCoeB, level) * expCoeK + expCoeN);
	}

	addExp(exp) {
		this.exp += exp;
		while ( this.exp >= this.currentExpForLevel ) {
			this.level ++;
			this.exp -= this.currentExpForLevel;
			this.currentExpForLevel = this.getExpForLevel(this.level);
		}
	}

	getPetalsForUpdate() {
		var petalsForUpdate = [];
		for ( var petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				petalsForUpdate.push(this.petals[petalID].serializeForUpdate());
			}
		}
		return petalsForUpdate;
	}

	serializeForUpdate() { // get neccesary data and send to client
		return {
			...(super.serializeForUpdate()),
			score: this.score,
			activeDirection: this.activeDirection, // the direction of input, not in use at the moment
			hp: this.hp,
			username: this.username,
			petals: this.getPetalsForUpdate(),
		};
	}
}

module.exports = Player;