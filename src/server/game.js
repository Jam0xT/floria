const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Player = require('./player');
const applyPlayerCollisions = require('./collisions');

class Game {
	constructor() {
		this.sockets = {};
		this.players = {};
		this.bullets = [];
		this.lastUpdateTime = Date.now();
		this.shouldSendUpdate = false;
		setInterval(this.update.bind(this), 1000 / Constants.TICK_PER_SECOND);
	}

	addPlayer(socket, username) {
		this.sockets[socket.id] = socket;

		const x = Constants.MAP_WIDTH * (0.25 + Math.random() * 0.5);
		const y = Constants.MAP_HEIGHT * (0.25 + Math.random() * 0.5);
		this.players[socket.id] = new Player(socket.id, username, x, y);
	}

	removePlayer(socket) {
		delete this.sockets[socket.id];
		delete this.players[socket.id];
	}

	handleInput(socket, input) {
		if ( this.players[socket.id] ) {
			this.players[socket.id].handleActiveMotion(input);
		}
	}

	update() {
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000;
		this.lastUpdateTime = now;

		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.update(deltaT);
		})

		const hurtPlayers = applyPlayerCollisions(this.players);

		hurtPlayers.forEach(element => {
			const player = this.players[element.playerID];
			player.hurtTime = 0;
			player.hp -= EntityAttributes.PLAYER.BODY_DAMAGE;
			const knockbackMagnitude = EntityAttributes.PLAYER.COLLISION_KNOCKBACK;
			const knockbackDirection = element.knockbackDirection;
			player.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
		})

		Object.keys(this.sockets).forEach(playerID => {
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			if ( player.hp <= 0 ) {
				console.log(`${player.username} is dead!`)
				socket.emit(Constants.MSG_TYPES.GAME_OVER);
				this.removePlayer(socket);
			}
		});

		if ( this.shouldSendUpdate ) {
			Object.keys(this.sockets).forEach(playerID => {
				const socket = this.sockets[playerID];
				const player = this.players[playerID];
				socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player))
			});
			this.shouldSendUpdate = false;
		} else {
			this.shouldSendUpdate = true;
		}
	}

	createUpdate(player) {
		const nearbyPlayers = Object.values(this.players).filter(
			p => p !== player && p.distanceTo(player) <= Constants.NEARBY_DISTANCE,
		);

		return {
			t: Date.now(),
			me: player.serializeForUpdate(),
			others: nearbyPlayers.map(p => p.serializeForUpdate()),
		}
	}
}

module.exports = Game;