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
		this.petalExpandRadius = 75;
		this.petals = [
			new PetalBasic(0, x, y, {x: x, y: y}, id),
			new PetalBasic(1, x, y, {x: x, y: y}, id),
			new PetalBasic(2, x, y, {x: x, y: y}, id),
			new PetalBasic(3, x, y, {x: x, y: y}, id),
			new PetalBasic(4, x, y, {x: x, y: y}, id),
		];
		this.petalType = ['BASIC', 'BASIC', 'BASIC', 'BASIC', 'BASIC',];
		this.inCooldown = [false, false, false, false, false,];
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
		this.attributes = Attribute;
	}
	
	// updatePetals(deltaT) {
	// 	this.firstPetalDirection -= this.rotateClockwise * this.rotationSpeed * deltaT;
	// 	if ( this.firstPetalDirection > 2 * Math.PI ) {
	// 		this.firstPetalDirection -= 2 * Math.PI;
	// 	}
	// 	if ( this.firstPetalDirection < - 2 * Math.PI ) {
	// 		this.firstPetalDirection += 2 * Math.PI;
	// 	}
	// 	const petalsChunks = [];
	// 	for ( var petalID = 0; petalID < this.slotCount; petalID ++ ) {
	// 		if ( !this.inCooldown[petalID] ) {
	// 			const petal = this.petals[petalID];
	// 			petal.rotateAndFollow(this.petalExpandRadius, this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount, {x: this.x, y: this.y});
	// 			petalsChunks.push({chunks: petal.update(deltaT), petalID: petal.id});
	// 		} else {
	// 			this.petals[petalID] -= deltaT;
	// 			if ( this.petals[petalID] <= 0 ) {
	// 				this.inCooldown[petalID] = false;
	// 				this.petals[petalID] = this.newPetal(this.petalType[petalID], petalID);
	// 			}
	// 		}
	// 	}
	// 	return petalsChunks;
	// }

	updatePetalMovement(deltaT) {
		
	}

	newPetal(type, petalID) {
		if ( type == 'BASIC' ) {
			return new PetalBasic(petalID, this.x, this.y, {x: this.x, y:this.y}, this.id);
		}
	}

	// getAccelerationMagnitude(magnitude, magnitudeCoe) { // calculate the accelertion magnitude in this.handleActiveMotion
	// 	const accelerationMagnitude = magnitude * magnitudeCoe;
	// 	return accelerationMagnitude;
	// }

	handleActiveMovement(activeMovement) { // handles active motion
		this.movement = activeMovement;
	}

	handleBorder(deltaT) {
		super.handleBorder(deltaT, this.attributes.RADIUS);
	}

	// applyForces(deltaT) {
	// 	// super.applyForces(deltaT, this.attributes.MASS);
	// }

	// applyMovement(deltaT) {
	// 	// does nothing currently
	// }

	// updateActiveMovement(deltaT) {
	// 	this.activeVelocity.x += this.activeAcceleration.x * deltaT;
	// 	this.activeVelocity.y += this.activeAcceleration.y * deltaT;

	// 	var activeVelocityX = this.activeVelocity.x;
	// 	var activeVelocityY = this.activeVelocity.y;

	// 	if ( Math.abs(activeVelocityX) > Math.abs(this.activeMotionMagnitude.x) ) {
	// 		if ( Math.abs(activeVelocityX) * Constants.SPEED_ATTENUATION_COEFFICIENT <= Math.abs(this.activeMotionMagnitude.x) ) {
	// 			activeVelocityX = this.activeMotionMagnitude.x;
	// 		} else {
	// 			activeVelocityX *= Constants.SPEED_ATTENUATION_COEFFICIENT;
	// 		}
	// 		this.activeVelocity.x = activeVelocityX;
	// 	}

	// 	if ( Math.abs(activeVelocityY) > Math.abs(this.activeMotionMagnitude.y) ) {
	// 		if ( Math.abs(activeVelocityY) * Constants.SPEED_ATTENUATION_COEFFICIENT <= Math.abs(this.activeMotionMagnitude.y) ) {
	// 			activeVelocityY = this.activeMotionMagnitude.y;
	// 		} else {
	// 			activeVelocityY *= Constants.SPEED_ATTENUATION_COEFFICIENT;
	// 		}
	// 		this.activeVelocity.y = activeVelocityY;
	// 	}

	// 	this.velocity.x += this.activeVelocity.x;
	// 	this.velocity.y += this.activeVelocity.y;
	// }

	updateChunks() {
		return super.updateChunks(this.attributes);
	}
 
	updateMovement(deltaT) {
		this.updatePetalMovement(deltaT);
	}

	// update(deltaT) { // updates every tick
	// 	this.updateActiveMovement(deltaT);
	// 	const petalsChunks = this.updatePetals(deltaT);
	// 	const playerChunks = super.update(deltaT, Attribute);
	// 	return {playerChunks: playerChunks, petalsChunks: petalsChunks};
	// }

	applyVelocity(deltaT) {
		super.applyVelocity(deltaT);
		for ( var petalID = 0; petalID < this.slotCount; petalID ++ ) {
			if ( !this.inCooldown[petalID] ) {
				const petal = this.petals[petalID];
				petal.applyVelocity(deltaT);
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