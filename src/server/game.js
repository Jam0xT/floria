const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');
const Player = require('./player');
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
		for ( var petalID = 0; petalID < this.players[playerID].slotCount; petalID ++ ) {
			if ( !this.players[playerID].inCooldown[petalID] ) {
				var petal = this.players[playerID].petals[petalID];
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
			}
		}
		delete this.sockets[playerID];
		delete this.players[playerID];
	}

	handleInput(socket, input) { // handle input from a player
		if ( this.players[socket.id] ) {
			this.players[socket.id].handleActiveMotion({
				direction: input.direction,
				magnitude: input.magnitude * EntityAttributes.PLAYER.SPEED,
			});
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

	handlePetalDeaths(player) {
		player.petals.forEach(petal => {
			if ( petal.hp <= 0 ) {
				player.inCooldown[petal.id] = true;
				petal.chunks.forEach(chunk => {
					if ( this.chunks[this.getChunkID(chunk)] ) {
						this.chunks[this.getChunkID(chunk)].splice(
							this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
								return entityInChunk.type == 'petal' && entityInChunk.id == {playerID: player.id, petalID: petal.id};
							}),
							1
						);
					}
				});
				player.reload(petal.id);
			}
		});
	}

	handlePlayerDeaths() {
		Object.keys(this.sockets).forEach(playerID => { // handle player deaths
			const player = this.players[playerID];
			this.handlePetalDeaths(player);
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
						if ( !player.inCooldown[petalID] ) {
							chunksOld.forEach(chunk => {
								if ( this.chunks[this.getChunkID(chunk)] ) {
									this.chunks[this.getChunkID(chunk)].splice(
										this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
											return entityInChunk.type == 'petal' && entityInChunk.id.playerID == playerID && entityInChunk.id.petalID == petalID
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
					}
				});
			}
			// console.log(this.chunks);
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

	applyVelocity(deltaT) {
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyVelocity(deltaT);
		});
		Object.keys(this.sockets).forEach(playerID => {
			this.players[playerID].applyVelocity(deltaT);
		})
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
		Object.values(this.chunks).forEach(entitiesInChunk => {
			const entityCount = entitiesInChunk.length;
			if ( entityCount <= 1 ) {
				return ;
			}
			for (let i = 0; i < entityCount - 1; i++) {
				for (let j = i + 1; j < entityCount; j++) {
					const entityInfoA = entitiesInChunk[i];
					const entityInfoB = entitiesInChunk[j];
					var entityA, entityB;
					if ( entityInfoA.type == 'player' ) {
						entityA = this.players[entityInfoA.id];
					} else if ( entityInfoA.type == 'mob' ) {
						entityA = this.mobs[entityInfoB.id].value;
					} else if ( entityInfoA.type == 'petal' ) {
						if ( !this.players[entityInfoA.id.playerID] )
							continue;
						if ( this.players[entityInfoA.id.playerID].inCooldown[entityInfoA.id.petalID] )
							continue;
						entityA = this.players[entityInfoA.id.playerID].petals[entityInfoA.id.petalID];
					}
					if ( entityInfoB.type == 'player' ) {
						entityB = this.players[entityInfoB.id];
					} else if ( entityInfoB.type == 'mob' ) {
						entityB = this.mobs[entityInfoB.id].value;
					} else if ( entityInfoB.type == 'petal' ) {
						if ( !this.players[entityInfoB.id.playerID] )
							continue;
						if ( this.players[entityInfoB.id.playerID].inCooldown[entityInfoB.id.petalID] )
							continue;
						entityB = this.players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
					}
					if ( entityA.team != entityB.team ) {
						if ( entityA.distanceTo(entityB) <= entityA.attributes.RADIUS + entityB.attributes.RADIUS) {
							const v1 = entityA.v, v2 = entityB.v;
							const theta2 = Math.atan2(entityA.x - entityB.x, entityB.y - entityA.y);
							const theta1 = theta2 - Math.PI;
							const gamma1 = Math.atan2(v1.x, v1.y), gamma2 = Math.atan2(v2.x, v2.y);
							var v3M = Math.sqrt(v1.x ** 2 + v1.y ** 2) * Math.cos(gamma1 - theta1);
							var v4M = Math.sqrt(v2.x ** 2 + v2.y ** 2) * Math.cos(gamma2 - theta2);
							var v3 = {
								x: v3M * Math.sin(theta1),
								y: v3M * Math.cos(theta1),
							}, v4 = {
								x: v4M * Math.sin(theta2),
								y: v4M * Math.cos(theta2),
							}
							const m1 = entityA.attributes.MASS, m2 = entityB.attributes.MASS;
							if ( v3M <= 0 && v4M <= 0 ) {
								continue;
							} else if ( v3M <= 0 ) {
								if ( v4M > -v3M ) {
									v4M += v3M;
									v3M = 0;
									v4 = {
										x: v4M * Math.sin(theta2),
										y: v4M * Math.cos(theta2),
									};
									v3 = {
										x: 0,
										y: 0,
									};
								} else {
									continue;
								}
							} else if ( v4M <= 0 ) {
								if ( v3M > -v4M ) {
									v3M += v4M;
									v4M = 0;
									v3 = {
										x: v3M * Math.sin(theta1),
										y: v3M * Math.cos(theta1),
									};
									v4 = {
										x: 0,
										y: 0,
									};
								} else {
									continue;
								}
							}
							const e1 = m1 * v3M * v3M, e2 = m2 * v4M * v4M;
							var direction, magnitude;
							if ( e1 >= e2 ) {
								direction = theta1;
							} else {
								direction = theta2;
							}
							magnitude = Math.sqrt(Math.abs(e1 - e2) / (m1 + m2));
							const vTot = {
								x: magnitude * Math.sin(direction),
								y: magnitude * Math.cos(direction),
							};
							entityA.velocity.x += vTot.x - v3.x;
							entityA.velocity.y += vTot.y - v3.y;
							entityB.velocity.x += vTot.x - v4.x;
							entityB.velocity.y += vTot.y - v4.y;
							entityA.hp -= entityB.attributes.DAMAGE;
							entityB.hp -= entityA.attributes.DAMAGE;
							entityA.hurtByInfo = entityInfoB;
							entityB.hurtByInfo = entityInfoA;
						}
					}
				}
			}
		});
	}

	update() { // called every tick
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000; // the length of the last tick

		this.lastUpdateTime = now;

		this.updatePlayers(deltaT);

		this.updateMobs(deltaT);

		this.handleCollisions();

		this.applyVelocity(deltaT);

		this.handleMobDeaths();

		this.handlePlayerDeaths();

		this.mobSpawn();

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
