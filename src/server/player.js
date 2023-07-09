const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;
const Petal = require('./petal');

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
		this.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_NORMAL;
		this.petals = [
			new Petal(0, x, y, id, 'ROSE', true, false),
			new Petal(1, x, y, id, 'STINGER', true, false),
			new Petal(2, x, y, id, 'STINGER', true, false),
			new Petal(3, x, y, id, 'STINGER', true, false),
			new Petal(4, x, y, id, 'BUBBLE', true, false),
		];
		this.activeDirection = 0;
		this.attributes = Attribute;
		this.attack = false;
		this.defend = false;
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
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				const theta = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
				let expandRadius = this.petalExpandRadius;
				if ( !petal.attributes.EXPANDABLE ) {
					expandRadius = Math.min(expandRadius, Constants.PETAL_EXPAND_RADIUS_NORMAL);
				}
				const goalPos = {
					x: this.x + expandRadius * Math.sin(theta),
					y: this.y + expandRadius * Math.cos(theta),
				}
				petal.movement = {
					direction: Math.atan2(goalPos.x - petal.x, petal.y - goalPos.y),
					speed: Math.sqrt((goalPos.x - petal.x) ** 2 + (goalPos.y - petal.y) ** 2) * Constants.PETAL_FOLLOW_SPEED,
				}
			} else {
				petal.cooldown -= deltaT;
				if ( petal.cooldown <= 0 ) {
					petal.inCooldown = false;
					this.petals[petalID] = this.newPetal(this.petals[petalID].type, petalID);
				}
			}
		}
	}

	newPetal(type, petalID) {
		return new Petal(petalID, this.x, this.y, this.id, type, true, false);
	}

	handleActiveMovement(activeMovement) { // handles active motion
		this.movement = activeMovement;
		this.activeDirection = activeMovement.direction;
	}

	update(deltaT) {
		if ( this.hp < this.maxHp ) {
			this.hp += ((this.maxHp / 240) * deltaT);
			this.hp = Math.min(this.hp, this.maxHp);
		}

		if ( this.hp < this.maxHp ) {
			for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
				const petal = this.petals[petalID];
				if ( !petal.inCooldown ) {
					if ( petal.attributes.TRIGGERS.HEAL ) { // trigger healing petals like rose, dahlia etc.
						petal.hp = -1;
						this.hp += petal.attributes.TRIGGERS.HEAL;
						this.hp = Math.min(this.hp, this.maxHp);
					}
				}
			}
		}

		if ( this.defend ) { // defend trigger
			for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
				const petal = this.petals[petalID];
				if ( !petal.inCooldown ) {
					if ( petal.attributes.TRIGGERS.BUBBLE_PUSH ) { // trigger bubble
						petal.hp = -1;
						const dir = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
						const push = petal.attributes.TRIGGERS.BUBBLE_PUSH;
						this.velocity.x -= push * Math.sin(dir);
						this.velocity.y += push * Math.cos(dir);
					}
				}
			}
		}

		// if ( this.attack ) {
		// 	for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
		// 		const petal = this.petals[petalID];
		// 		if ( !petal.inCooldown ) {
		// 			if ( petal.attributes.TRIGGERS.SHOOT ) { // trigger shootable petals like missile, dandelion etc.
		// 				const dir = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
		// 				const push = petal.attributes.TRIGGERS.BUBBLE_PUSH;
		// 				this.velocity.x -= push * Math.sin(dir);
		// 				this.velocity.y += push * Math.cos(dir);
		// 			}
		// 		}
		// 	}
		// }
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
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.updateVelocity(deltaT);
			}
		}
	}

	applyVelocity(deltaT) {
		super.applyVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyVelocity(deltaT);
			}
		}
	}
	
	applyConstraintVelocity(deltaT) {
		super.applyConstraintVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyConstraintVelocity(deltaT);
			}
		}
	}

	handleBorder() {
		super.handleBorder(this.attributes.RADIUS);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.handleBorder(petal.attributes.RADIUS);
			}
		}
	}

	reload(petalID) {
		const petal = this.petals[petalID];
		petal.cooldown = this.petals[petalID].attributes.RELOAD;
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
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petalsForUpdate.push(petal.serializeForUpdate());
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