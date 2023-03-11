const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Player = require('./player');
const applyPlayerCollisions = require('./collisions');

class Game {
	constructor() {
		this.leaderboard = [{score: -1}];
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

		this.updateLeaderboard(this.players[socket.id]);
	}

	disconnectPlayer(socket) {
		if ( this.players[socket.id] ) {
			this.removeFromLeaderboard(this.players[socket.id]);
		}
		this.removePlayer(socket);
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

	getRankOnLeaderboard(playerID) {
		return (this.leaderboard.findIndex((player) => {
			return player.id == playerID;
		}));
	}

	removeFromLeaderboard(player) {
		this.leaderboard.splice(this.getRankOnLeaderboard(player.id), 1);
	}

	updateLeaderboard(player) {
		if ( player.haveRankOnLeaderboard == false ) {
			this.leaderboard.push({
				score: 1,
				id: player.id,
				username: player.username,
			});
			player.haveRankOnLeaderboard = true;
			return ;
		}
		const rankOnLeaderboard = this.getRankOnLeaderboard(player.id);
		var playerRank = rankOnLeaderboard;
		const playerScore = player.score;
		var rankChanged = false;
		while( playerScore > this.leaderboard[playerRank].score && playerRank > 0 ) {
			playerRank --;
			rankChanged = true;
		}
		if ( rankChanged )
			playerRank ++;
		this.leaderboard.splice(rankOnLeaderboard, 1);
		this.leaderboard.splice(playerRank, 0, {score: playerScore, id: player.id, username: player.username});
	}

	handlePlayerDeath(player) {
		const killedBy = this.players[player.hurtBy];
		killedBy.score += Math.floor(EntityAttributes.PLAYER.VALUE + player.score / 2);
		console.log(killedBy.score);
		this.updateLeaderboard(killedBy);
		this.removeFromLeaderboard(player);
		console.log(`${player.username} is dead!`);
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
			player.hurtBy = element.hurtBy;
			player.hp -= EntityAttributes.PLAYER.BODY_DAMAGE;
			const knockbackMagnitude = EntityAttributes.PLAYER.COLLISION_KNOCKBACK;
			const knockbackDirection = element.knockbackDirection;
			player.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
		})

		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			if ( player.hp <= 0 ) {
				this.handlePlayerDeath(player);
			}
		});

		Object.keys(this.sockets).forEach(playerID => {
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			if ( player.hp <= 0 ) {
				socket.emit(Constants.MSG_TYPES.GAME_OVER);
				this.removePlayer(socket);
			}
		})

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
			leaderboard: this.leaderboard.slice(0, Constants.LEADERBOARD_LENGTH + 1),
			rankOnLeaderboard: this.getRankOnLeaderboard(player.id),
			me: player.serializeForUpdate(),
			others: nearbyPlayers.map(p => p.serializeForUpdate()),
			playerCount: Object.keys(this.players).length,
		}
	}
}

module.exports = Game;