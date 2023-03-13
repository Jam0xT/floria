const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;

class Player extends Entity {
	constructor(id, username, x, y) {
		super(id, x, y, id, 'PLAYER', EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE);
		// a player's team equals to his id
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
		this.exp = 0;
		this.slotCount = 5;
	}

	update(deltaT) { // updates velocity every tick
		return super.update(deltaT, Attribute);
	}

	handleActiveMotion(activeMotion) { // handles active motion (the motion from player input)
		super.handleActiveMotion(activeMotion, Attribute.MASS);
	}

	addExp(exp) {
		this.exp += exp;
	}

	serializeForUpdate() { // get neccesary data and send to client
		return {
			...(super.serializeForUpdate()),
			score: this.score,
			activeDirection: this.activeDirection, // the direction of input, not in use at the moment
			hp: this.hp,
			username: this.username,
		};
	}
}

module.exports = Player;