const ObjectClass = require('./object');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;

class Player extends ObjectClass {
	constructor(id, username, x, y) {
		super(id, x, y, EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE);
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
	}

	update(deltaT) { // updates velocity every tick
		super.update(deltaT, Attribute);
	}

	handleActiveMotion(activeMotion) {
		super.handleActiveMotion(activeMotion, Attribute.MASS);
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			score: this.score,
			activeDirection: this.activeDirection,
			hp: this.hp,
			username: this.username,
		};
	}
}

module.exports = Player;