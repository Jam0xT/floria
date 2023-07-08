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
			this.players[socket.id].handleActiveMovement({
				direction: input.direction,
				speed: input.magnitude * EntityAttributes.PLAYER.SPEED,
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

	handlePlayerDeath(player) { // handles a single player death
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

	handlePetalDeaths(player) { // make dead petals in cooldown
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

	handlePlayerDeaths() { // handle mutiple player death
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

	handleMobDeaths() { // remove dead mobs
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

	getChunkID(chunk) { // gets the ID of the chunk
		return chunk.x * Constants.CHUNK_ID_CONSTANT + chunk.y;
	}

	applyForces(deltaT) {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.applyForces(deltaT);
		});
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyForces(deltaT);
		});
	}

	// updatePlayers(deltaT) { // update players, their petals and the chunks they are in
	// 	Object.keys(this.sockets).forEach(playerID => {
	// 		const player = this.players[playerID];
	// 		const {playerChunks, petalsChunks} = player.update(deltaT); // update player ( and the player's petals )
	// 		if ( playerChunks ) { // update the players chunks
	// 			const chunksOld = playerChunks.chunksOld;
	// 			const chunksNew = playerChunks.chunksNew;
	// 			chunksOld.forEach(chunk => {
	// 				if ( this.chunks[this.getChunkID(chunk)] ) {
	// 					const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
	// 						return ( entityInChunk.type == 'player' ) && ( entityInChunk.id == playerID );
	// 					});
	// 					this.chunks[this.getChunkID(chunk)].splice(idx, 1);
	// 				}
	// 			});
	// 			chunksNew.forEach(chunk => {
	// 				if ( this.chunks[this.getChunkID(chunk)] ) {
	// 					this.chunks[this.getChunkID(chunk)].push({type: 'player', id: playerID});
	// 				} else {
	// 					this.chunks[this.getChunkID(chunk)] = new Array({type: 'player', id: playerID});
	// 				}
	// 			});
	// 		}
	// 		if ( petalsChunks ) { // update the player's petals' chunks
	// 			petalsChunks.forEach(petalChunks => {
	// 				if ( petalChunks.chunks ) {
	// 					const chunksOld = petalChunks.chunks.chunksOld;
	// 					const chunksNew = petalChunks.chunks.chunksNew;
	// 					const petalID = petalChunks.petalID;
	// 					if ( !player.inCooldown[petalID] ) {
	// 						chunksOld.forEach(chunk => {
	// 							if ( this.chunks[this.getChunkID(chunk)] ) {
	// 								const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
	// 									return ( entityInChunk.type == 'petal' ) && ( entityInChunk.id.playerID == playerID ) && ( entityInChunk.id.petalID == petalID );
	// 								});
	// 								this.chunks[this.getChunkID(chunk)].splice(idx, 1);
	// 							}
	// 						});
	// 						chunksNew.forEach(chunk => {
	// 							if ( this.chunks[this.getChunkID(chunk)] ) {
	// 								this.chunks[this.getChunkID(chunk)].push({type: 'petal', id: {playerID: playerID, petalID: petalID}});
	// 							} else {
	// 								this.chunks[this.getChunkID(chunk)] = new Array({type: 'petal', id: {playerID: playerID, petalID: petalID}});
	// 							}
	// 						});
	// 					}
	// 				}
	// 			});
	// 		}
	// 	});
	// }

	updateMovement() {
		Object.values(this.mobs).forEach(mob => {
			mob.value.updateMovement();
		});
	}

	updateVelocity(deltaT) {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.updateVelocity(deltaT);
		});
		Object.values(this.mobs).forEach(mob => {
			mob.value.updateVelocity(deltaT);
		});
	}

	// updateMobs(deltaT) { // update mobs and chunks they are in
	// 	Object.values(this.mobs).forEach(mob => {
	// 		const chunks = mob.value.update(deltaT, mob.value.attributes);
	// 		if ( chunks ) {
	// 			const chunksOld = chunks.chunksOld;
	// 			const chunksNew = chunks.chunksNew;
	// 			chunksOld.forEach(chunk => {
	// 				if( this.chunks[this.getChunkID(chunk)] ) {
	// 					const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
	// 						return ( entityInChunk.type == 'mob' ) && ( entityInChunk.id == mob.value.id );
	// 					});
	// 					if ( idx != -1 )
	// 						this.chunks[this.getChunkID(chunk)].splice(idx, 1);
	// 				}
	// 			});
	// 			chunksNew.forEach(chunk => {
	// 				if( this.chunks[this.getChunkID(chunk)] ) {
	// 					this.chunks[this.getChunkID(chunk)].push({type: 'mob', id: mob.value.id});
	// 				} else {
	// 					this.chunks[this.getChunkID(chunk)] = new Array({type: 'mob', id: mob.value.id});
	// 				}
	// 			});
	// 		}
	// 	});
	// }

	applyVelocity(deltaT) { // apply velocity for each entity
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyVelocity(deltaT);
		});
		Object.keys(this.sockets).forEach(playerID => {
			this.players[playerID].applyVelocity(deltaT);
		})
	}

	rnd(x, y) { // returns a random number in range [x, y]
		return ((Math.random() * y) + x);
	}

	getNewMobID() { // get a new mob ID when a mob spawns
		this.mobID ++;
		return `mob-${this.mobID}`;
	}

	mobSpawn() { // spawns mobs
		if ( this.mobSpawnTimer <= 0 ) {
			this.mobSpawnTimer = Constants.MOB_SPAWN_INTERVAL;
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
			this.mobSpawnTimer --;
		}
	}

	solveCollisions(deltaT) { // handle collisions
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
						entityA = this.mobs[entityInfoA.id].value;
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
					if ( ( entityA.team != entityB.team ) || ( entityA.friendlyCollisions && entityB.friendlyCollisions ) ) {
						const distance = entityA.distanceTo(entityB);
						const r1 = entityA.attributes.RADIUS, r2 = entityB.attributes.RADIUS;
						if ( distance < r1 + r2) {
							const depth = r1 + r2 - distance;
							const mA = entityA.attributes.MASS, mB = entityB.attributes.MASS;
							const theta2 = Math.atan2(entityA.x - entityB.x, entityB.y - entityA.y); // orientation of A relative to B
							const theta1 = theta2 - Math.PI; // orientation of B relative to A
							const vA = {
								direction: Math.atan2(entityA.velocity.x, entityA.velocity.y),
								magnitude: Math.sqrt(entityA.velocity.x ** 2, entityA.velocity.y ** 2),
							};
							const vB = {
								direction: Math.atan2(entityB.velocity.x, entityB.velocity.y),
								magnitude: Math.sqrt(entityB.velocity.x ** 2, entityB.velocity.y ** 2),
							};
							const va = vA.magnitude * Math.cos(theta1 - vA.direction);
							const vb = vB.magnitude * Math.cos(theta2 - vB.direction);
							const velocityWeightInCollision = Constants.VELOCITY_WEIGHT_IN_COLLISION;
							const penetrationDepthWeightInCollision = Constants.PENETRATION_DEPTH_WEIGHT_IN_COLLISION;
							const baseKnockback = Constants.BASE_KNOCKBACK;
							if ( va > 0 ) {
								entityA.velocity.x += va * Math.sin(theta2) * velocityWeightInCollision;
								entityA.velocity.y += va * Math.cos(theta2) * velocityWeightInCollision;
							}
							if ( vb > 0 ) {
								entityB.velocity.x += vb * Math.sin(theta1) * velocityWeightInCollision;
								entityB.velocity.y += vb * Math.cos(theta1) * velocityWeightInCollision;
							}
							const velA = depth * penetrationDepthWeightInCollision * mB / (mA + mB);
							const velB = depth * penetrationDepthWeightInCollision * mA / (mA + mB);
							console.log(velA, velB);
							entityA.velocity.x += velA * Math.sin(theta2) / deltaT;
							entityA.velocity.y += velA * Math.cos(theta2) / deltaT;
							entityB.velocity.x += velB * Math.sin(theta1) / deltaT;
							entityB.velocity.y += velB * Math.cos(theta1) / deltaT;
							const knockbackA = baseKnockback * mB / (mA + mB) + entityB.attributes.EXTRA_KNOCKBACK / mA;
							const knockbackB = baseKnockback * mA / (mA + mB) + entityA.attributes.EXTRA_KNOCKBACK / mB;
							entityA.velocity.x += knockbackA * Math.sin(theta2);
							entityA.velocity.y += knockbackA * Math.cos(theta2);
							entityB.velocity.x += knockbackB * Math.sin(theta1);
							entityB.velocity.y += knockbackB * Math.cos(theta1);
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

	updateChunks() {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			const playerChunks = player.updateChunks(); // update player ( and the player's petals )
			if ( playerChunks ) { // update the players chunks
				const chunksOld = playerChunks.chunksOld;
				const chunksNew = playerChunks.chunksNew;
				chunksOld.forEach(chunk => {
					if ( this.chunks[this.getChunkID(chunk)] ) {
						const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
							return ( entityInChunk.type == 'player' ) && ( entityInChunk.id == playerID );
						});
						this.chunks[this.getChunkID(chunk)].splice(idx, 1);
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
		});
		Object.values(this.mobs).forEach(mob => {
			const chunks = mob.value.updateChunks();
			if ( chunks ) {
				const chunksOld = chunks.chunksOld;
				const chunksNew = chunks.chunksNew;
				chunksOld.forEach(chunk => {
					if( this.chunks[this.getChunkID(chunk)] ) {
						const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
							return ( entityInChunk.type == 'mob' ) && ( entityInChunk.id == mob.value.id );
						});
						if ( idx != -1 )
							this.chunks[this.getChunkID(chunk)].splice(idx, 1);
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

	handleBorder(deltaT) {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.handleBorder(deltaT);
		});
		Object.values(this.mobs).forEach(mob => {
			mob.value.handleBorder(deltaT);
		});
	}

	update() { // updates the game every tick
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000; // the length of the last tick

		this.lastUpdateTime = now;

		this.updateMovement();

		this.updateVelocity(deltaT);

		this.applyVelocity(deltaT);

		this.updateChunks();

		this.solveCollisions(deltaT);

		this.handleBorder(deltaT);

		this.handleMobDeaths();

		this.handlePlayerDeaths();

		this.mobSpawn();

		this.sendUpdate();

		// console.log(Object.values(this.players));
		
		// console.log(`mspt: ${Date.now() - now}`);
	}

	sendUpdate() { // send update to each client
		Object.keys(this.sockets).forEach(playerID => {
			const socket = this.sockets[playerID];
			const player = this.players[playerID];
			socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player))
		});
	}

	createUpdate(player) { // create the update and return to sendUpdate()
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
