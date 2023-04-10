const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;
const PetalBasic = require('./petal/basic');

class Player extends Entity {
	constructor(id, username, x, y) {
		super(id, x, y, id, 'mob', 'PLAYER', EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE, false);
		// a player's team equals to his id
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
		this.exp = 0;
		this.level = 1;
		this.currentExpForLevel = this.getExpForLevel(this.level);
		this.slotCount = Constants.SLOT_COUNT_BASE;
		this.petalCount = 5; // petalCount doesn't always equal to slotCount because some petals have more than one object
		this.rotationSpeed = Constants.PETAL_ROTATION_SPEED_BASE;
		this.firstPetalDirection = 0;
		this.rotateClockwise = 1; // 1 for clockwise, -1 for counter-clockwise
		this.petalExpandRadius = 100;
		this.petals = [
			new PetalBasic(0, x, y, {x: this.x, y: this.y}, id),
			new PetalBasic(1, x, y, {x: this.x, y: this.y}, id),
			new PetalBasic(2, x, y, {x: this.x, y: this.y}, id),
			new PetalBasic(3, x, y, {x: this.x, y: this.y}, id),
			new PetalBasic(4, x, y, {x: this.x, y: this.y}, id),
		];
	}
	
	updatePetals(deltaT) {
		this.firstPetalDirection += this.rotateClockwise * this.rotationSpeed * deltaT;
		if ( this.firstPetalDirection > 2 * Math.PI ) {
			this.firstPetalDirection -= 2 * Math.PI;
		}
		if ( this.firstPetalDirection < - 2 * Math.PI ) {
			this.firstPetalDirection += 2 * Math.PI;
		}
		this.petals.forEach(petal => {
			petal.rotateAndFollow(this.petalExpandRadius, this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalCount, {x: this.x, y: this.y});
			petal.update(deltaT);
		});
	}
 
	update(deltaT) { // updates every tick
		this.updatePetals(deltaT);
		return super.update(deltaT, Attribute);
	}

	handleActiveMotion(activeMotion) { // handles active motion (the motion from player input)
		super.handleActiveMotion(activeMotion, Attribute.ACTIVE_SPEED_COE);
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
		this.petals.forEach(petal => {
			petalsForUpdate.push(petal.serializeForUpdate());
		});
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