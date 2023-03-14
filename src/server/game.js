const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Player = require('./player');
const applyCollisions = require('./collisions');
const Bubble = require('./entity/bubble');

var TOTAL_SPAWN_WEIGHT = 0; // this is a constant
Object.values(EntityAttributes).forEach(attribute => {
	TOTAL_SPAWN_WEIGHT += attribute.SPAWN_WEIGHT;
});

class Game {
	constructor() {
		this.leaderboard = [{score: -1}]; // the leaderboard handles all players, but only send the first 'LEADERBOARD_LENGTH' objects to each client
		this.sockets = {};
		this.players = {};
		this.entities = {}; // {id:{type: type, mob: mob},...}
		this.chunks = {}; // {{x:x, y:x}:[{type: type, id: id},...],...}
		this.lastUpdateTime = Date.now();
		this.mobSpawnTimer = 0;
		this.volumeTaken = 0;
		this.shouldSendUpdate = false;
		this.mobID = 0;
		setInterval(this.update.bind(this), 1000 / Constants.TICK_PER_SECOND); // update the game every tick
	}

	addPlayer(socket, username) { // add a player
		this.sockets[socket.id] = socket;

		const x = Constants.MAP_WIDTH * (0.25 + Math.random() * 0.5);
		const y = Constants.MAP_HEIGHT * (0.25 + Math.random() * 0.5);

		this.players[socket.id] = new Player(socket.id, username, x, y);

		this.updateLeaderboard(this.players[socket.id]);
	}

	onPlayerDisconnect(socket) { // calls when a player is disconnected (currently the webpage will refresh for a player that dies)
		if ( this.players[socket.id] ) {
			this.removeFromLeaderboard(this.players[socket.id]);
			this.removePlayer(socket);
		}
	}

	removePlayer(socket) { // remove a player
		delete this.chunks[this.getChunkID(this.players[socket.id].chunk)];
		delete this.sockets[socket.id];
		delete this.players[socket.id];
	}

	handleInput(socket, input) { // handle input from a player
		if ( this.players[socket.id] ) {
			this.players[socket.id].handleActiveMotion(input);
		}
	}

	getRankOnLeaderboard(playerID) { // find the rank of a player
		return (this.leaderboard.findIndex((player) => {
			return player.id == playerID;
		}));
	}

	removeFromLeaderboard(player) { // remove a player from leaderboard
		this.leaderboard.splice(this.getRankOnLeaderboard(player.id), 1);
	}

	updateLeaderboard(player) { // called when a player's score changes, update the player's rank on leaderboard
		if ( player.haveRankOnLeaderboard == false ) { // this is true only if this function is called in this.addPlayer.
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
		while( playerScore > this.leaderboard[playerRank].score && playerRank > 0 ) {// comparing one by one, can be optimized with binary search
			playerRank --;
			rankChanged = true;
		}
		if ( rankChanged )
			playerRank ++;
		this.leaderboard.splice(rankOnLeaderboard, 1);
		this.leaderboard.splice(playerRank, 0, {score: playerScore, id: player.id, username: player.username});
	}

	handlePlayerDeath(player) {
		// called when a player dies, adding score to 'killedBy' and remove the dead player from leaderboard
		// this function will not remove the player itself
		const killedByInfo = player.hurtByInfo;
		if ( killedByInfo.type == 'player' ) {
			const killedBy = this.players[killedByInfo.id];
			killedBy.score += Math.floor(EntityAttributes.PLAYER.VALUE + player.score / 2);
			if ( this.getRankOnLeaderboard(killedBy.id) > 0 ) {
				// avoid crashing when two players kill each other at the exact same time
				// it will crash because the player who killed you is not on the leaderboard anymore
				// (the player who killed you is dead, and he has already been removed from leaderboard)
				this.updateLeaderboard(killedBy);
			}
		}
		this.removeFromLeaderboard(player);
		console.log(`${player.username} is dead!`);
	}

	handlePlayerDeaths() {
		Object.keys(this.sockets).forEach(playerID => { // handle player deaths
			const player = this.players[playerID];
			if ( player.hp <= 0 ) {
				this.handlePlayerDeath(player);
			}
		});

		Object.keys(this.sockets).forEach(playerID => { // remove dead players
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			if ( player.hp <= 0 ) {
				socket.emit(Constants.MSG_TYPES.GAME_OVER);
				this.removePlayer(socket);
			}
		})
	}

	handleEntityDeaths() {
		Object.keys(this.entities).forEach(mobID => {
			const entity = this.entities[mobID];
			if ( entity.mob.hp <= 0 ) {
				const killedByInfo = entity.mob.hurtByInfo;
				if ( killedByInfo.type == 'player' ) {
					const killedBy = this.players[killedByInfo.id];
					killedBy.score += Math.floor(EntityAttributes[entity.type].VALUE);
					if ( this.getRankOnLeaderboard(killedBy.id) > 0 ) {
						this.updateLeaderboard(killedBy);
					}
				}
				delete this.chunks[this.getChunkID(entity.mob.chunk)];
				delete this.entities[mobID];
			}
		});
	}

	updatePlayers(deltaT) {
		Object.keys(this.sockets).forEach(playerID => { // updates the movement of each player
			const player = this.players[playerID];
			const chunk = player.update(deltaT);
			if ( chunk ) {
				const chunkOld = chunk.chunkOld;
				const chunkNew = chunk.chunkNew;
				if( this.chunks[this.getChunkID(chunkOld)] ) {
					this.chunks[this.getChunkID(chunkOld)].splice(
						this.chunks[this.getChunkID(chunkOld)].findIndex((entityInChunk) => {
							return entityInChunk.type == 'player' && entityInChunk.id == playerID;
						}),
						1
					);
				}
				if( this.chunks[this.getChunkID(chunkNew)] ) {
					this.chunks[this.getChunkID(chunkNew)].push({type: 'player', id: playerID});
				} else {
					this.chunks[this.getChunkID(chunkNew)] = new Array({type: 'player', id: playerID});
				}
			}
		});
	}

	getChunkID(chunk) {
		return chunk.x * Constants.CHUNK_ID_CONSTANT + chunk.y;
	}

	updateEntities(deltaT) {
		Object.values(this.entities).forEach(entity => {
			const chunk = entity.mob.update(deltaT, EntityAttributes[entity.type]);
			if ( chunk ) {
				const chunkOld = chunk.chunkOld;
				const chunkNew = chunk.chunkNew;
				if( this.chunks[this.getChunkID(chunkOld)] ) {
					this.chunks[this.getChunkID(chunkOld)].splice(
						this.chunks[this.getChunkID(chunkOld)].findIndex((entityInChunk) => {
							return entityInChunk.type == 'mob' && entityInChunk.id == entity.mob.id;
						}),
						1
					);
				}
				if( this.chunks[this.getChunkID(chunkNew)] ) {
					this.chunks[this.getChunkID(chunkNew)].push({type: 'mob', id: entity.mob.id});
				} else {
					this.chunks[this.getChunkID(chunkNew)] = new Array({type: 'mob', id: entity.mob.id});
				}
			}
		});
	}

	rnd(x, y) {
		return ((Math.random() * y) + x);
	}

	getNewMobID() {
		this.mobID ++;
		return `mob-${this.mobID}`;
	}

	mobSpawn() {
		if ( this.mobSpawnTimer >= Constants.MOB_SPAWN_INTERVAL ) {
			this.mobSpawnTimer = 0;
			while ( this.volumeTaken < Constants.MOB_VOLUME_LIMIT ) {
				const mobNumber = this.rnd(1, TOTAL_SPAWN_WEIGHT);
				const currentMobNumber = 0;
				Object.values(EntityAttributes).forEach(attribute => {
					const weight = attribute.SPAWN_WEIGHT;
					const volume = attribute.VOLUME;
					if ( currentMobNumber < mobNumber && currentMobNumber + weight >= mobNumber ) {
						this.volumeTaken += volume;
						const spawnX = this.rnd(0, Constants.MAP_WIDTH);
						const spawnY = this.rnd(0, Constants.MAP_HEIGHT);
						if ( attribute.TYPE == 'BUBBLE' ) {
							const newMobID = this.getNewMobID();
							this.entities[newMobID] = {
								type: attribute.TYPE,
								mob: new Bubble(newMobID, spawnX, spawnY, 'mob-hostile'),
							};
							// console.log(`A bubble spawned at (${spawnX}, ${spawnY}) !`);
						}
					}
				});
			}
		} else {
			this.mobSpawnTimer ++;
		}
	}

	handleCollisions() {
		const {hurtPlayers, hurtEntities} = applyCollisions(this.players, this.entities, this.chunks);
		// applyCollisions: check collisions and return involved players and mobs

		hurtPlayers.forEach(element => {
			const {entityID, sourceInfo, knockbackDirection} = element;
			const player = this.players[entityID];
			player.hurtTime = 0;
			player.hurtByInfo = sourceInfo;
			var sourceAttribute;
			if ( sourceInfo.type == 'player' ) {
				sourceAttribute = EntityAttributes['PLAYER'];
			} else if ( sourceInfo.type == 'mob' ) {
				sourceAttribute = EntityAttributes[this.entities[sourceInfo.id].type];
			}
			player.hp -= sourceAttribute.BODY_DAMAGE;
			const knockbackMagnitude = sourceAttribute.COLLISION_KNOCKBACK;
			player.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
			
		});

		hurtEntities.forEach(element => {
			const {entityID, sourceInfo, knockbackDirection} = element;
			const entity = this.entities[entityID];
			entity.mob.hurtTime = 0;
			entity.mob.hurtByInfo = sourceInfo;
			var sourceAttribute;
			if ( sourceInfo.type == 'player' ) {
				sourceAttribute = EntityAttributes['PLAYER'];
			} else if ( sourceInfo.type == 'mob' ) {
				sourceAttribute = EntityAttributes[this.entities[sourceInfo.id].type];
			}
			entity.mob.hp -= sourceAttribute.BODY_DAMAGE;
			const knockbackMagnitude = sourceAttribute.COLLISION_KNOCKBACK;
			entity.mob.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
		});
	}

	update() { // called every tick
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000; // the length of the last tick
		this.lastUpdateTime = now;

		this.updatePlayers(deltaT);

		this.updateEntities(deltaT);

		this.mobSpawn();

		this.handleCollisions();

		this.handlePlayerDeaths();
		
		this.handleEntityDeaths();

		this.sendUpdate();
	}

	sendUpdate() {
		if ( this.shouldSendUpdate ) { // send updates to client
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

	createUpdate(player) { // send update to client
		const nearbyPlayers = Object.values(this.players).filter(
			p => {
				return p !== player && p.distanceTo(player) <= Constants.NEARBY_DISTANCE;
			}
		); // getting nearby players

		const nearbyEntities = Object.values(this.entities).filter(
			e => {
				return e.mob.distanceTo(player) <= Constants.NEARBY_DISTANCE;
			}
		) // getting nearby entities

		return {
			t: Date.now(), // current time
			leaderboard: this.leaderboard.slice(0, Constants.LEADERBOARD_LENGTH + 1), // leaderboard
			rankOnLeaderboard: this.getRankOnLeaderboard(player.id), // this player's rank on leaderboard
			me: player.serializeForUpdate(), // this player
			others: nearbyPlayers.map(p => p.serializeForUpdate()), // nearby players
			playerCount: Object.keys(this.players).length, // the number of players online
			entities: nearbyEntities.map(e => e.mob.serializeForUpdate()),
		}
	}
}

module.exports = Game;
