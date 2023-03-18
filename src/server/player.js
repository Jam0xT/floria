const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;
const PetalBasic = require('./petal/basic');

class Player extends Entity {
	constructor(id, username, x, y) {
		super(id, x, y, id, 'mob', 'PLAYER', EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE);
		// a player's team equals to his id
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
		this.exp = 0;
		this.level = 1;
		this.currentExpForLevel = this.getExpForLevel(this.level);
		this.slotCount = 5;
		this.petalCount = 5;
		this.rotationSpeed = 2.5;
		this.firstPetalPosition = 0;
		this.petalExpandRadius = 100;
		this.petals = [
			new PetalBasic(0, x, y, id),
			new PetalBasic(1, x, y, id),
			new PetalBasic(2, x, y, id),
			new PetalBasic(3, x, y, id),
			new PetalBasic(4, x, y, id),
		];
	}

	updatePetals(deltaT) {
		this.firstPetalPosition += this.rotationSpeed * deltaT;
		this.petals.forEach(petal => {
			const toX = this.x + Math.sin(this.firstPetalPosition + (petal.id * Math.PI * 2 / this.petalCount)) * this.petalExpandRadius;
			const toY = this.y - Math.cos(this.firstPetalPosition + (petal.id * Math.PI * 2 / this.petalCount)) * this.petalExpandRadius;
			petal.handleActiveMotion({
				direction: Math.atan2(toX - petal.x, petal.y - toY),
				magnitude: this.rotationSpeed * this.petalExpandRadius,
			}, 25);
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