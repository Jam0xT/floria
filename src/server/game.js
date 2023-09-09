const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');
const Player = require('./player');
const Bubble = require('./entity/bubble');
const Dark_ladybug = require('./entity/dark_ladybug');
const Hornet = require(`./entity/hornet`);
const { listen } = require('express/lib/application');

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
		this.lightningPath = [];
		this.diedEntities = [];
		setInterval(this.update.bind(this), 1000 / Constants.TICK_PER_SECOND); // update the game every tick
	}

	// client networking

	addPlayer(socket, username) { // add a player
		this.sockets[socket.id] = socket;

		const x = Constants.MAP_WIDTH * this.rnd(0.1, 0.9);
		const y = Constants.MAP_HEIGHT * this.rnd(0.1, 0.9);

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
		for ( let petalID = 0; petalID < this.players[playerID].petals.length; petalID ++ ) {
			let petal = this.players[playerID].petals[petalID];
			if ( !petal.inCooldown ) {
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

	handleMouseDown(socket, mouseDownEvent) {
		const player = this.players[socket.id];
		if ( player ) {
			if ( mouseDownEvent & 1 ) {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_ATTACK;
				player.attack = true;
				if ( mouseDownEvent & 2 ) {
					player.defend = true;
				}
			} else if ( mouseDownEvent & 2 ) {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_DEFEND;
				player.defend = true;
			} else {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_NORMAL;
			}
		}
	}

	handleMouseUp(socket, mouseUpEvent) {
		const player = this.players[socket.id];
		if ( player ) {
			if ( mouseUpEvent & 1 ) {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_ATTACK;
				if ( !(mouseUpEvent & 2) ) {
					player.defend = false;
				}
			} else if ( mouseUpEvent & 2 ) {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_DEFEND;
				player.attack = false;
			} else {
				player.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_NORMAL;
				player.attack = false;
				player.defend = false;
			}
		}
	}

	handlePetalSwitch(socket, petalA, petalB, implement) {
		const player = this.players[socket.id];
		player.switchPetals(petalA, petalB, implement);
	}

	handlePetalDisable(socket, petal) {
		const player = this.players[socket.id];
		player.disablePetal(petal);
	}

	handleMovement(socket, movement) { // handle input from a player
		const player = this.players[socket.id];
		if ( player ) {
			player.handleActiveMovement({
				direction: movement.direction,
				speed: movement.magnitude * EntityAttributes.PLAYER.SPEED,
			});
		}
	}

	// leaderboard

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

	// handle deaths

	handlePlayerDeath(player) { // handles a single player death
		// called when a player dies, adding score to 'killedBy' and remove the dead player from leaderboard
		// this function will not remove the player itself
		this.diedEntities.push({
			x: player.x,
			y: player.y,
			type: `player`,
			movement: player.movement,
			size: player.attributes.RENDER_RADIUS,
		});
		const killedByInfo = player.hurtByInfo;
		if ( killedByInfo.type == 'player' || killedByInfo.type == 'petal' ) {
			var killedBy;
			if ( killedByInfo.type == 'player' ) {
				killedBy = this.players[killedByInfo.id];
			} else if ( killedByInfo.type == 'petal' ) {
				killedBy = this.players[killedByInfo.id.playerID];
			}
			if ( killedBy ) {
				killedBy.score += Math.floor(EntityAttributes.PLAYER.VALUE + player.score * Constants.SCORE_LOOTING_COEFFICIENT);
				killedBy.addExp(EntityAttributes.PLAYER.EXPERIENCE + player.totalExp * Constants.EXP_LOOTING_COEFFICIENT);
				if ( this.getRankOnLeaderboard(killedBy.id) > 0 ) {
					// avoid crashing when two players kill each other at the exact same time
					// it will crash because the player who killed you is not on the leaderboard anymore
					// (the player who killed you is dead, and he has already been removed from leaderboard)
					this.updateLeaderboard(killedBy);
					killedBy.maxHp += 10;
				}
			}
		}
		this.removeFromLeaderboard(player);
		console.log(`${player.username} is dead!`);
	}

	handlePetalDeaths(player) { // make dead petals in cooldown
		player.petals.forEach(petal => {
			if ( !petal.inCooldown ) {
				if ( petal.hp <= 0 ) {
					this.diedEntities.push({
						x: petal.x,
						y: petal.y,
						type: petal.type,
						movement: petal.movement,
						size: petal.attributes.RENDER_RADIUS,
					});
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
					if ( petal.placeHolder != -1 ) {
						petal.inCooldown = true;
						player.reload(petal.placeHolder);
					}
				}
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
					killedBy.addExp(EntityAttributes[mob.type].EXPERIENCE);
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
				this.diedEntities.push({
					x: this.mobs[mobID].value.x,
					y: this.mobs[mobID].value.y,
					type: this.mobs[mobID].type,
					movement: this.mobs[mobID].value.movement,
					size: this.mobs[mobID].value.attributes.RENDER_RADIUS,
					isMob: true,
				});
				delete this.mobs[mobID];
			}
		});
	}
	
	init(deltaT) {
		this.lightningPath = [];
		this.diedEntities = [];
	}

	// movement

	applyForces(deltaT) {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.applyForces(deltaT);
		});
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyForces(deltaT);
		});
	}

	updateMovement(deltaT) {
		Object.values(this.players).forEach(player => {
			player.updateMovement(deltaT);
		});
		Object.values(this.mobs).forEach(mob => {
			if (mob.value.sensitization) { //判断mob是否为主动型生物
				if (!mob.value.target || !this.players[mob.value.target]) { //没有目标或者目标不存在
					let distances = [],
						ids = [];
						
					Object.entries(this.players).forEach(([id,player]) => {
						let distance = Math.sqrt((mob.value.x - player.x) ** 2 + (mob.value.y - player.y) ** 2);
						distances.push(distance);
						ids.push(id);
					});
					
					mob.value.target = ids[distances.indexOf(Math.min(distances))];
				}
			}
			
			if (mob.value.target) {
				const target = this.players[mob.value.target];
				mob.value.updateMovement(deltaT,target);
				return;
			}
			
			mob.value.updateMovement(deltaT);
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

	applyVelocity(deltaT) { // apply velocity for each entity
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyVelocity(deltaT);
		});
		Object.keys(this.sockets).forEach(playerID => {
			this.players[playerID].applyVelocity(deltaT);
		});
	}

	updateChunks() {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			const playerChunks = player.updateChunks(); // update player
			if ( playerChunks ) { // update the player's chunks
				const chunksOld = playerChunks.chunksOld;
				const chunksNew = playerChunks.chunksNew;
				chunksOld.forEach(chunk => {
					if ( this.chunks[this.getChunkID(chunk)] ) {
						const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
							return ( entityInChunk.type == 'player' ) && ( entityInChunk.id == playerID );
						});
						if ( idx != -1 )
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
			const petals = player.petals; // update the player's petals
			for ( let petalID = 0; petalID < player.petals.length; petalID ++ ) {
				const petal = petals[petalID];
				if ( !petal.inCooldown ) {
					const petalChunks = petal.updateChunks(petal.attributes.RADIUS);
					if ( petalChunks ) { // update the petals' chunks
						const chunksOld = petalChunks.chunksOld;
						const chunksNew = petalChunks.chunksNew;
						chunksOld.forEach(chunk => {
							if ( this.chunks[this.getChunkID(chunk)] ) {
								const idx = this.chunks[this.getChunkID(chunk)].findIndex((entityInChunk) => {
									return ( entityInChunk.type == 'petal' ) && ( entityInChunk.id.playerID == playerID ) && ( entityInChunk.id.petalID == petalID );
								});
								if ( idx != -1 )
									this.chunks[this.getChunkID(chunk)].splice(idx, 1);
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

	// other functions

	rnd(x, y) { // returns a random number in range [x, y]
		return ((Math.random() * y) + x);
	}
	
	getChunkID(chunk) { // gets the ID of the chunk
		return chunk.x * Constants.CHUNK_ID_CONSTANT + chunk.y;
	}

	// mob spawn

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
								value: new Bubble(newMobID, spawnX, spawnY, 'mobTeam'),
							};
						}
						else if ( attribute.TYPE == 'DARK_LADYBUG' ) {
							const newMobID = this.getNewMobID();
							this.mobs[newMobID] = {
								type: attribute.TYPE,
								value: new Dark_ladybug(newMobID, spawnX, spawnY, 'mobTeam'),
							};
						}
						else if ( attribute.TYPE == 'HORNET' ) {
							const newMobID = this.getNewMobID();
							this.mobs[newMobID] = {
								type: attribute.TYPE,
								value: new Hornet(newMobID, spawnX, spawnY, 'mobTeam'),
							};
						}
					}
				});
			}
		} else {
			this.mobSpawnTimer --;
		}
	}

	// solve collisions

	solveCollisions(deltaT) { // handle collisions
		let collisions = [];
		Object.values(this.chunks).forEach(entitiesInChunk => {
			const entityCount = entitiesInChunk.length;
			if ( entityCount <= 1 ) {
				return ;
			}
			for (let i = 0; i < entityCount - 1; i++) {
				for (let j = i + 1; j < entityCount; j++) {
					const entityInfoA = entitiesInChunk[i];
					const entityInfoB = entitiesInChunk[j];
					let entityA, entityB;
					if ( entityInfoA.type == 'player' ) {
						entityA = this.players[entityInfoA.id];
					} else if ( entityInfoA.type == 'mob' ) {
						entityA = this.mobs[entityInfoA.id].value;
					} else if ( entityInfoA.type == 'petal' ) {
						if ( !this.players[entityInfoA.id.playerID] )
							continue;
						if ( this.players[entityInfoA.id.playerID].petals[entityInfoA.id.petalID].inCooldown )
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
						if ( this.players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID].inCooldown )
							continue;
						entityB = this.players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
					}
					if ( ( entityA.team == entityB.team ) && ( entityInfoA.type == 'petal' || entityInfoB.type == 'petal' ) ) // petals do not collide with anything of the same team
						continue;
					const distance = entityA.distanceTo(entityB);
					const r1 = entityA.attributes.RADIUS, r2 = entityB.attributes.RADIUS;
					if ( distance < r1 + r2) {
						collisions.push({
							infoA: entityInfoA,
							infoB: entityInfoB,
						});
					}
				}
			}
		});
		collisions = collisions.reduce((accumulator, cur) => {
			if ( !accumulator.find((item) => {
				let sameA = false, sameB = false;
				if ( item.infoA.type != 'petal' ) {
					sameA = ( (item.infoA.type == cur.infoA.type) && (item.infoA.id == cur.infoA.id) );
				} else {
					sameA = ( (item.infoA.id.playerID == cur.infoA.id.playerID) && (item.infoA.id.petalID == cur.infoA.id.petalID) )
				}
				if ( item.infoB.type != 'petal' ) {
					sameB = ( (item.infoB.type == cur.infoB.type) && (item.infoB.id == cur.infoB.id) );
				} else {
					sameB = ( (item.infoB.id.playerID == cur.infoB.id.playerID) && (item.infoB.id.petalID == cur.infoB.id.petalID) )
				}
				return sameA && sameB;
			}) ) {
				accumulator.push(cur);
			}
			return accumulator;
		}, []);
		for (let i = 0; i < collisions.length; i ++ ) {
			const collision = collisions[i];
			const entityInfoA = collision.infoA, entityInfoB = collision.infoB;
			let entityA, entityB;
			if ( entityInfoA.type == 'player' ) {
				entityA = this.players[entityInfoA.id];
			} else if ( entityInfoA.type == 'mob' ) {
				entityA = this.mobs[entityInfoA.id].value;
			} else if ( entityInfoA.type == 'petal' ) {
				if ( !this.players[entityInfoA.id.playerID] )
					continue;
				if ( this.players[entityInfoA.id.playerID].petals[entityInfoA.id.petalID].inCooldown )
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
				if ( this.players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID].inCooldown )
					continue;
				entityB = this.players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
			}
			const distance = entityA.distanceTo(entityB);
			const r1 = entityA.attributes.RADIUS, r2 = entityB.attributes.RADIUS;
			const depth = r1 + r2 - distance;
			const mA = entityA.attributes.MASS, mB = entityB.attributes.MASS;
			const theta2 = Math.atan2(entityA.x - entityB.x, entityB.y - entityA.y); // orientation of A relative to B
			const theta1 = theta2 - Math.PI; // orientation of B relative to A
			const penetrationDepthWeightInCollision = Constants.PENETRATION_DEPTH_WEIGHT_IN_COLLISION;
			const velA = depth * penetrationDepthWeightInCollision * mB / (mA + mB);
			const velB = depth * penetrationDepthWeightInCollision * mA / (mA + mB);
			entityA.constraintVelocity.x += velA * Math.sin(theta2) / deltaT;
			entityA.constraintVelocity.y += velA * Math.cos(theta2) / deltaT;
			entityB.constraintVelocity.x += velB * Math.sin(theta1) / deltaT;
			entityB.constraintVelocity.y += velB * Math.cos(theta1) / deltaT;
			if ( entityA.team != entityB.team ) {
				if ( entityInfoA.type == 'player' ) {
					entityA.velocity.x += velA * Math.sin(theta2) / deltaT;
					entityA.velocity.y += velA * Math.cos(theta2) / deltaT;
					const baseKnockback = Constants.BASE_KNOCKBACK;
					const knockbackA = baseKnockback * mB / (mA + mB);
					entityA.velocity.x += knockbackA * Math.sin(theta2);
					entityA.velocity.y += knockbackA * Math.cos(theta2);
					if ( entityInfoB.type == 'petal' ) {
						this.players[entityB.parent].hp -= entityB.attributes.DAMAGE * entityA.damageReflect * (1 + entityB.fragile);
					} else if ( entityInfoB.type == 'player' ) {
						entityA.hp -= entityA.attributes.DAMAGE * entityB.damageReflect * (1 + entityA.fragile);
						entityB.hp -= entityB.attributes.DAMAGE * entityA.damageReflect * (1 + entityB.fragile);
						if ( entityA.bodyToxicity > 0 ) {
							if ( entityB.poison * entityB.poisonTime < entityA.bodyPoison ) {
								entityB.poison = entityA.bodyToxicity;
								entityB.poisonTime = entityA.bodyPoison / entityA.bodyToxicity;
							}
						}
						if ( entityB.bodyToxicity > 0 ) {
							if ( entityA.poison * entityA.poisonTime < entityB.bodyPoison ) {
								entityA.poison = entityB.bodyToxicity;
								entityA.poisonTime = entityB.bodyPoison / entityB.bodyToxicity;
							}
						}
					}
				}
				if ( entityInfoB.type == 'player' ) {
					entityB.velocity.x += velB * Math.sin(theta1) / deltaT;
					entityB.velocity.y += velB * Math.cos(theta1) / deltaT;
					const baseKnockback = Constants.BASE_KNOCKBACK;
					const knockbackB = baseKnockback * mA / (mA + mB);
					entityB.velocity.x += knockbackB * Math.sin(theta1);
					entityB.velocity.y += knockbackB * Math.cos(theta1);
					if ( entityInfoA.type == 'petal' ) {
						this.players[entityA.parent].hp -= entityA.attributes.DAMAGE * entityB.damageReflect * (1 + entityA.fragile);
					}
				}
				entityA.hp -= entityB.attributes.DAMAGE * (1 + entityA.fragile);
				entityB.hp -= entityA.attributes.DAMAGE * (1 + entityB.fragile);
				
				if (entityB.attributes.TRIGGERS) {
					if ( entityB.attributes.TRIGGERS.NO_HEAL ) {
						entityA.noHeal = entityB.attributes.TRIGGERS.NO_HEAL;
					}
					if ( entityB.attributes.TRIGGERS.POISON ) {
						if ( entityA.poison * entityA.poisonTime < entityB.attributes.TRIGGERS.POISON ) {
							entityA.poison = entityB.attributes.TRIGGERS.TOXICITY;
							entityA.poisonTime = entityB.attributes.TRIGGERS.POISON / entityB.attributes.TRIGGERS.TOXICITY;
						}
					}
					if ( entityB.attributes.TRIGGERS.PUNCTURE ) {
						if ( entityA.puncture < entityB.attributes.TRIGGERS.PUNCTURE ) {
							entityA.puncture = entityB.attributes.TRIGGERS.PUNCTURE;
							entityA.fragile = entityB.attributes.TRIGGERS.PUNCTURE_DAMAGE;
						}
					}
					if ( entityB.attributes.TRIGGERS.LIGHTNING ) {
						let possibleEntityPositions = [];
						let lightningPath = [];
						
						lightningPath.push({
							x: entityB.x,
							y: entityB.y,
						});
						lightningPath.push({
							x: entityA.x,
							y: entityA.y,
						});
						
						Object.entries(this.players).forEach(([id,player]) => {
							if (player.id == entityB.team) return;
							if (Math.sqrt((player.x - entityA.x) ** 2 + (player.y - entityA.y) ** 2) <= Constants.LIGHTNING_LENGTH * entityB.attributes.TRIGGERS.LIGHTNING) {
								possibleEntityPositions.push([player.x,player.y,id]);
							}
						})
						Object.entries(this.mobs).forEach(([id,mob]) => {
							if (Math.sqrt((mob.value.x - entityA.x) ** 2 + (mob.value.y - entityA.y) ** 2) <= Constants.LIGHTNING_LENGTH * entityB.attributes.TRIGGERS.LIGHTNING) {
								possibleEntityPositions.push([mob.value.x,mob.value.y,id]);
							}
						})
						
						let nextTargetEntityPosition = {
							x: entityA.x,
							y: entityA.y,
						}
						let damagedEntity = [];
						
						for (let times = 0; times < entityB.attributes.TRIGGERS.LIGHTNING; times++) {
							let distances = [],
								ids = [];
					
							possibleEntityPositions.forEach(([entityX,entityY,id]) => {
								if (damagedEntity.includes(id)) return;
								let distance = Math.sqrt((entityX - nextTargetEntityPosition.x) ** 2 + (entityY - nextTargetEntityPosition.y) ** 2);
								if (distance <= Constants.LIGHTNING_LENGTH) {
									distances.push(distance);
									ids.push(id);
								}
							})
					
							let nextTargetEntity = ids[distances.indexOf(Math.min(distances))];
							if (!nextTargetEntity) continue;
						
							//判断连锁目标为玩家还是mob并且造成伤害
							if (nextTargetEntity.charAt(0) == `m`) {
								let mob = this.mobs[nextTargetEntity].value;
								mob.hp -= entityB.attributes.DAMAGE * (1 + mob.fragile);
								mob.hurtByInfo = entityInfoB;
								nextTargetEntityPosition.x = mob.x;
								nextTargetEntityPosition.y = mob.y;
								lightningPath.push({
									x: mob.x,
									y: mob.y,
								});
							} else{
								let player = this.players[nextTargetEntity];
								player.hp -= entityB.attributes.DAMAGE * (1 + player.fragile);
								player.hurtByInfo = entityInfoB;
								nextTargetEntityPosition.x = player.x;
								nextTargetEntityPosition.y = player.y;
								lightningPath.push({
									x: player.x,
									y: player.y,
								});
							}
							damagedEntity.push(nextTargetEntity);
						}
						this.lightningPath.push(lightningPath);
					}
				}
				if (entityA.attributes.TRIGGERS) {
					if ( entityA.attributes.TRIGGERS.NO_HEAL ) {
						entityB.noHeal = entityA.attributes.TRIGGERS.NO_HEAL;
					}
					if ( entityA.attributes.TRIGGERS.POISON ) {
						if ( entityB.poison * entityB.poisonTime < entityA.attributes.TRIGGERS.POISON ) {
							entityB.poison = entityA.attributes.TRIGGERS.TOXICITY;
							entityB.poisonTime = entityA.attributes.TRIGGERS.POISON / entityA.attributes.TRIGGERS.TOXICITY;
						}
					}
					if ( entityA.attributes.TRIGGERS.PUNCTURE ) {
						if ( entityB.puncture < entityA.attributes.TRIGGERS.PUNCTURE ) {
							entityB.puncture = entityA.attributes.TRIGGERS.PUNCTURE;
							entityB.fragile = entityA.attributes.TRIGGERS.PUNCTURE_DAMAGE;
						}
					}
					if ( entityA.attributes.TRIGGERS.LIGHTNING ) {
						let possibleEntityPositions = [];
						let lightningPath = [];
						
						lightningPath.push({
							x: entityA.x,
							y: entityA.y,
						});
						lightningPath.push({
							x: entityB.x,
							y: entityB.y,
						});
						
						Object.entries(this.players).forEach(([id,player]) => {
							if (player.id == entityA.team) return;
							if (Math.sqrt((player.x - entityB.x) ** 2 + (player.y - entityB.y) ** 2) <= Constants.LIGHTNING_LENGTH * entityA.attributes.TRIGGERS.LIGHTNING) {
								possibleEntityPositions.push([player.x,player.y,id]);
							}
						})
						Object.entries(this.mobs).forEach(([id,mob]) => {
							if (Math.sqrt((mob.value.x - entityB.x) ** 2 + (mob.value.y - entityB.y) ** 2) <= Constants.LIGHTNING_LENGTH * entityA.attributes.TRIGGERS.LIGHTNING) {
								possibleEntityPositions.push([mob.value.x,mob.value.y,id]);
							}
						})
						
						let nextTargetEntityPosition = {
							x: entityB.x,
							y: entityB.y,
						}
						let damagedEntity = [];
						damagedEntity.push(entityB.id);
						
						for (let times = 0; times < entityA.attributes.TRIGGERS.LIGHTNING; times++) {
							let distances = [],
								ids = [];

							possibleEntityPositions.forEach(([entityX,entityY,id]) => {
								if (damagedEntity.includes(id)) return;
								let distance = Math.sqrt((entityX - nextTargetEntityPosition.x) ** 2 + (entityY - nextTargetEntityPosition.y) ** 2);
								if (distance <= Constants.LIGHTNING_LENGTH) {
									distances.push(distance);
									ids.push(id);
								}
							})

							let nextTargetEntity = ids[distances.indexOf(Math.min(...distances))];
							if (!nextTargetEntity) continue;
							
							//判断连锁目标为玩家还是mob并且造成伤害
							if (nextTargetEntity.charAt(0) == `m`) {
								let mob = this.mobs[nextTargetEntity].value;
								mob.hp -= entityA.attributes.DAMAGE * (1 + mob.fragile);
								mob.hurtByInfo = entityInfoA;
								nextTargetEntityPosition.x = mob.x;
								nextTargetEntityPosition.y = mob.y;
								lightningPath.push({
									x: mob.x,
									y: mob.y,
								});
							} else{
								let player = this.players[nextTargetEntity];
								player.hp -= entityA.attributes.DAMAGE * (1 + player.fragile);
								player.hurtByInfo = entityInfoA;
								nextTargetEntityPosition.x = player.x;
								nextTargetEntityPosition.y = player.y;
								lightningPath.push({
									x: player.x,
									y: player.y,
								});
							}
							damagedEntity.push(nextTargetEntity);
						}
						this.lightningPath.push(lightningPath);
					}
				}
				
				if (entityA.puncture > 0) {
					entityA.puncture--;
				}
				if (entityA.puncture == 0) {
					entityA.fragile = 0;
				}
				if (entityB.puncture > 0) {
					entityB.puncture--;
				}
				if (entityB.puncture == 0) {
					entityB.fragile = 0;
				}

				entityA.hurtByInfo = entityInfoB;
				entityB.hurtByInfo = entityInfoA;
			}
		}
	}

	applyConstraintVelocity(deltaT) {
		Object.values(this.mobs).forEach(mob => {
			mob.value.applyConstraintVelocity(deltaT);
		});
		Object.keys(this.sockets).forEach(playerID => {
			this.players[playerID].applyConstraintVelocity(deltaT);
		})
	}

	handleBorder() {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.handleBorder();
		});
		Object.values(this.mobs).forEach(mob => {
			mob.value.handleBorder();
		});
	}

	// update players

	updatePlayers(deltaT) {
		Object.keys(this.sockets).forEach(playerID => {
			const player = this.players[playerID];
			player.update(deltaT);
		});
	}

	// update

	update() { // updates the game every tick
		const now = Date.now();
		const deltaT = (now - this.lastUpdateTime) / 1000; // the length of the last tick

		this.lastUpdateTime = now;
		
		this.init(deltaT);

		this.updatePlayers(deltaT);

		this.updateMovement(deltaT);

		this.updateVelocity(deltaT);

		this.applyVelocity(deltaT);

		this.updateChunks();

		this.handleBorder();

		this.solveCollisions(deltaT);

		this.applyConstraintVelocity(deltaT);

		this.handleBorder();

		this.handleMobDeaths();

		this.handlePlayerDeaths();

		this.mobSpawn();

		this.sendUpdate();

		// console.log(Object.values(this.players));
		
		// console.log(`mspt: ${Date.now() - now}`);
	}

	// send update

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
			me: player.serializeForUpdate(true), // this player
			others: nearbyPlayers.map(p => p.serializeForUpdate(false)), // nearby players
			playerCount: Object.keys(this.players).length, // the number of players online
			mobs: nearbyMobs.map(e => e.value.serializeForUpdate()),
			lightningPath: this.lightningPath,
			diedEntities: this.diedEntities,
		}
	
	}
}

module.exports = Game;
