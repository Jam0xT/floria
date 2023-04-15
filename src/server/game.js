const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');
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
		this.mobs = {}; // {id:{type: mobType, value: mob},...}
		this.chunks = {}; // {chunkID:[{type: entityType, id: id},...],...}
		this.lastUpdateTime = Date.now();
		this.mobSpawnTimer = 0;
		this.volumeTaken = 0;
		// this.shouldSendUpdate = false;
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
		const playerID = socket.id;
		this.players[playerID].chunks.forEach(chunk => {
			if ( this.chunks[this.getChunkID(chunk)] ) {
				this.chunks[this.getChunkID(chunk)].splice(
					this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
						return entityInChunk.type == 'player' && entityInChunk.id == playerID;
					}),
					1
				);
			}
		});
		this.players[playerID].petals.forEach(petal => {
			petal.chunks.forEach(chunk => {
				if ( this.chunks[this.getChunkID(chunk)] ) {
					this.chunks[this.getChunkID(chunk)].splice(
						this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
							return entityInChunk.type == 'petal' && entityInChunk.id == {playerID: playerID, petalID: petal.id};
						}),
						1
					);
				}
			});
		});
		delete this.sockets[playerID];
		delete this.players[playerID];
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
		if ( killedByInfo.type == 'player' || killedByInfo.type == 'petal' ) {
			var killedBy;
			if ( killedByInfo.type == 'player' ) {
				killedBy = this.players[killedByInfo.id];
			} else if ( killedByInfo.type == 'petal' ) {
				killedBy = this.players[killedByInfo.id.playerID];
			}
			killedBy.score += Math.floor(EntityAttributes.PLAYER.VALUE + player.score * Constants.SCORE_LOOTING_COEFFICIENT);
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

	handleMobDeaths() {
		Object.keys(this.mobs).forEach(mobID => {
			const mob = this.mobs[mobID];
			if ( mob.value.hp <= 0 ) {
				const killedByInfo = mob.value.hurtByInfo;
				if ( killedByInfo.type == 'player' || killedByInfo.type == 'petal') {
					var killedBy;
					if ( killedByInfo.type == 'player' ) {
						killedBy = this.players[killedByInfo.id];
					} else if ( killedByInfo.type == 'petal' ) {
						killedBy = this.players[killedByInfo.id.playerID];
					}
					killedBy.score += Math.floor(EntityAttributes[mob.type].VALUE);
					if ( this.getRankOnLeaderboard(killedBy.id) > 0 ) {
						this.updateLeaderboard(killedBy);
					}
				}
				mob.value.chunks.forEach(chunk => {
					if( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].splice(
							this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
								return entityInChunk.type == 'mob' && entityInChunk.id == mob.value.id;
							}),
							1
						);
					}
				});
				this.volumeTaken -= EntityAttributes[mob.type].VOLUME;
				delete this.mobs[mobID];
			}
		});
	}

	getChunkID(chunk) {
		return chunk.x * Constants.CHUNK_ID_CONSTANT + chunk.y;
	}

	updatePlayers(deltaT) {
		// console.log(this.chunks);
		Object.keys(this.sockets).forEach(playerID => { // updates the movement of each player
			const player = this.players[playerID];
			const {playerChunks, petalsChunks} = player.update(deltaT);
			if ( playerChunks ) {
				const chunksOld = playerChunks.chunksOld;
				const chunksNew = playerChunks.chunksNew;
				chunksOld.forEach(chunk => {
					if ( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].splice(
							this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
								return entityInChunk.type == 'player' && entityInChunk.id == playerID;
							}),
							1
						);
					}
				});
				chunksNew.forEach(chunk => {
					if ( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].push({type: 'player', id: playerID});
					} else {
						this.chunks[this.getChunkID(chunk)] = new Array({type: 'player', id: playerID});
					}
				});
			}
			if ( petalsChunks ) {
				petalsChunks.forEach(petalChunks => {
					if ( petalChunks.chunks ) {
						const chunksOld = petalChunks.chunks.chunksOld;
						const chunksNew = petalChunks.chunks.chunksNew;
						const petalID = petalChunks.petalID;
						chunksOld.forEach(chunk => {
							if ( this.chunks[this.getChunkID(chunk)] ) {
								this.chunks[this.getChunkID(chunk)].splice(
									this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
										return entityInChunk.type == 'petal' && entityInChunk.id == {playerID: playerID, petalID: petalID};
									}),
									1
								);
							}
						});
						chunksNew.forEach(chunk => {
							if ( this.chunks[this.getChunkID(chunk)] ) {
								this.chunks[this.getChunkID(chunk)].push({type: 'petal', id: {playerID: playerID, petalID: petalID}});
							} else {
								this.chunks[this.getChunkID(chunk)] = new Array({type: 'petal', id: {playerID: playerID, petalID: petalID}});
							}
						});
					}
				});
			}
		});
	}

	updateMobs(deltaT) {
		Object.values(this.mobs).forEach(mob => {
			const chunks = mob.value.update(deltaT, EntityAttributes[mob.type]);
			if ( chunks ) {
				const chunksOld = chunks.chunksOld;
				const chunksNew = chunks.chunksNew;
				chunksOld.forEach(chunk => {
					if( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].splice(
							this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
								return entityInChunk.type == 'mob' && entityInChunk.id == mob.value.id;
							}),
							1
						);
					}
				});
				chunksNew.forEach(chunk => {
					if( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].push({type: 'mob', id: mob.value.id});
					} else {
						this.chunks[this.getChunkID(chunk)] = new Array({type: 'mob', id: mob.value.id});
					}
				});
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
							this.mobs[newMobID] = {
								type: attribute.TYPE,
								value: new Bubble(newMobID, spawnX, spawnY, 'mob-hostile'),
							};
						}
					}
				});
			}
		} else {
			this.mobSpawnTimer ++;
		}
	}

	handleCollisions() {
		const {hurtPlayers, hurtMobs, hurtPetals} = applyCollisions(this.players, this.mobs, this.chunks);
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
				sourceAttribute = EntityAttributes[this.mobs[sourceInfo.id].type];
			} else if ( sourceInfo.type == 'petal' ) {
				sourceAttribute = PetalAttributes[this.players[sourceInfo.id.playerID].petals[sourceInfo.id.petalID].type];
			}
			player.hp -= sourceAttribute.DAMAGE;
			const knockbackMagnitude = sourceAttribute.COLLISION_KNOCKBACK;
			player.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
		});

		hurtMobs.forEach(element => {
			const {entityID, sourceInfo, knockbackDirection} = element;
			const entity = this.mobs[entityID];
			entity.value.hurtTime = 0;
			entity.value.hurtByInfo = sourceInfo;
			var sourceAttribute;
			if ( sourceInfo.type == 'player' ) {
				sourceAttribute = EntityAttributes['PLAYER'];
			} else if ( sourceInfo.type == 'mob' ) {
				sourceAttribute = EntityAttributes[this.mobs[sourceInfo.id].type];
			} else if ( sourceInfo.type == 'petal' ) {
				sourceAttribute = PetalAttributes[this.players[sourceInfo.id.playerID].petals[sourceInfo.id.petalID].type];
			}
			entity.value.hp -= sourceAttribute.DAMAGE;
			const knockbackMagnitude = sourceAttribute.COLLISION_KNOCKBACK;
			entity.value.handlePassiveMotion({
				direction: knockbackDirection,
				magnitude: knockbackMagnitude,
			});
		});

		Object.keys(hurtPetals).forEach(parentID => {
			hurtPetals[parentID].forEach(element => {
				const {petalID, sourceInfo, knockbackDirection} = element;
				const petal = this.players[parentID].petals[petalID];
				petal.hurtTime = 0;
				petal.hurtByInfo = sourceInfo;
				var sourceAttribute;
				if ( sourceInfo.type == 'player' ) {
					sourceAttribute = EntityAttributes['PLAYER'];
				} else if ( sourceInfo.type == 'mob' ) {
					sourceAttribute = EntityAttributes[this.mobs[sourceInfo.id].type];
				} else if ( sourceInfo.type == 'petal' ) {
					sourceAttribute = PetalAttributes[this.players[sourceInfo.id.playerID].petals[sourceInfo.id.petalID].type];
				}
				petal.hp -= sourceAttribute.DAMAGE;
				const knockbackMagnitude = sourceAttribute.COLLISION_KNOCKBACK;
				petal.handlePassiveMotion({
					direction: knockbackDirection,
					magnitude: knockbackMagnitude,
				});
			});
		})
	}

	update() { // called every tick
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000; // the length of the last tick
		this.lastUpdateTime = now;

		this.updatePlayers(deltaT);

		this.updateMobs(deltaT);

		this.mobSpawn();

		this.handleCollisions();

		this.handleMobDeaths();

		this.handlePlayerDeaths();

		this.sendUpdate();
	}

	sendUpdate() {
		// send updates to client
		Object.keys(this.sockets).forEach(playerID => {
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player))
		});
	}

	createUpdate(player) { // send update to client
		const nearbyPlayers = Object.values(this.players).filter(
			p => {
				return p !== player && p.distanceTo(player) <= Constants.NEARBY_DISTANCE;
			}
		); // getting nearby players

		const nearbyMobs = Object.values(this.mobs).filter(
			e => {
				return e.value.distanceTo(player) <= Constants.NEARBY_DISTANCE;
			}
		) // getting nearby mobs

		return {
			t: Date.now(), // current time
			leaderboard: this.leaderboard.slice(0, Constants.LEADERBOARD_LENGTH + 1), // leaderboard
			rankOnLeaderboard: this.getRankOnLeaderboard(player.id), // this player's rank on leaderboard
			me: player.serializeForUpdate(), // this player
			others: nearbyPlayers.map(p => p.serializeForUpdate()), // nearby players
			playerCount: Object.keys(this.players).length, // the number of players online
			mobs: nearbyMobs.map(e => e.value.serializeForUpdate()),
		}
	}
}

module.exports = Game;
