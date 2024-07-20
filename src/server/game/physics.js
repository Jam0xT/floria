/*
处理游戏物理

$ = this.var

$.chunks: {chunkID -> [{type -> entityType, id -> id}]}
*/
import Constants from '../../shared/constants.js';

const chunk_id_constant = 114514;

function init() {
	const $ = this.var;
	$.chunks = {};
}

function updateMovement(dt) {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		player.updateMovement(dt);
	});
}

function updateVelocity(dt) {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		player.updateVelocity(dt);
	});
}

function handleBorder() {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		player.handleBorder();
	});
}

function updatePlayers(dt) {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		player.update(dt);
	});
}

function updateChunks() {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		const playerChunks = player.updateChunks(); // update player
		if ( playerChunks ) { // update the player's chunks
			const chunksOld = playerChunks.chunksOld;
			const chunksNew = playerChunks.chunksNew;
			chunksOld.forEach(chunk => {
				if ( $.chunks[getChunkID(chunk)] ) {
					const idx = $.chunks[getChunkID(chunk)].findIndex((entityInChunk) => {
						return ( entityInChunk.type == 'player' ) && ( entityInChunk.id == id );
					});
					if ( idx != -1 )
						$.chunks[getChunkID(chunk)].splice(idx, 1);
				}
			});
			chunksNew.forEach(chunk => {
				if ( $.chunks[getChunkID(chunk)] ) {
					$.chunks[getChunkID(chunk)].push({type: 'player', id: id});
				} else {
					$.chunks[getChunkID(chunk)] = new Array({type: 'player', id: id});
				}
			});
		}
		player.petals.forEach((petals) => { // update the player's petals
			petals.forEach((petal) => {
				if ( !petal.inCooldown ) {
					const petalChunks = petal.updateChunks(petal.attributes.RADIUS);
					if ( petalChunks ) { // update the petals' chunks
						const chunksOld = petalChunks.chunksOld;
						const chunksNew = petalChunks.chunksNew;
						chunksOld.forEach(chunk => {
							if ( $.chunks[getChunkID(chunk)] ) {
								const idx = $.chunks[getChunkID(chunk)].findIndex((entityInChunk) => {
									return ( entityInChunk.type == 'petal' ) && ( entityInChunk.id.playerID == id ) && ( entityInChunk.id.petalID == petal.id );
								});
								if ( idx != -1 )
									$.chunks[getChunkID(chunk)].splice(idx, 1);
							}
						});
						chunksNew.forEach(chunk => {
							if ( $.chunks[getChunkID(chunk)] ) {
								$.chunks[getChunkID(chunk)].push({type: 'petal', id: {playerID: id, petalID: petal.id}});
							} else {
								$.chunks[getChunkID(chunk)] = new Array({type: 'petal', id: {playerID: id, petalID: petal.id}});
							}
						});
					}
				}
			})
		});
	});
}

function getChunkID(chunk) { // gets the ID of the chunk
	return chunk.x * chunk_id_constant + chunk.y;
}

function solveCollisions(dt) {
	const $ = this.var;
	let collisions = [];
	Object.values($.chunks).forEach(entitiesInChunk => {
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
					entityA = $.entities[entityInfoA.id];
				} else if ( entityInfoA.type == 'petal' ) {
					const player = $.entities[entityInfoA.id.playerID];
					if ( !player )
						continue;
					try{
						player.petals.forEach(petals => {
							petals.forEach(petal => {
								if (petal.id == entityInfoA.id.petalID) {
									if (petal.inCooldown || petal.isHide) {
										throw Error();
									} else{
										entityA = petal;
									}
								}
							});
						});
					}catch(e){
						continue;
					}
				}
				if ( entityInfoB.type == 'player' ) {
					entityB = $.entities[entityInfoB.id];
				} else if ( entityInfoB.type == 'petal' ) {
					const player = $.entities[entityInfoB.id.playerID];
					if ( !player )
						continue;
					try{
						player.petals.forEach(petals => {
							petals.forEach(petal => {
								if (petal.id == entityInfoB.id.petalID) {
									if (petal.inCooldown) {
										throw Error();
									} else{
										entityB = petal;
									}
								}
							});
						});
					}catch(e){
						continue;
					}
				}
				if (!entityA || !entityB) continue;
				if ( ( entityA.team == entityB.team ) && ( entityInfoA.type == 'petal' || entityInfoB.type == 'petal' ) ) // petals do not collide with anything of the same team
					continue;
				if (entityA.team == entityB.team && (entityA.attributes.ATTACK_MODE == 'PROJECTILE' || entityB.attributes.ATTACK_MODE == 'PROJECTILE'))
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
			entityA = $.entities[entityInfoA.id];
		} else if ( entityInfoA.type == 'petal' ) {
			const player = $.entities[entityInfoA.id.playerID];
			if ( !player )
				continue;
			try{
				player.petals.forEach(petals => {
					petals.forEach(petal => {
						if (petal.id == entityInfoA.id.petalID) {
							if (petal.inCooldown) {
								throw Error();
							} else{
								entityA = petal;
							}
						}
					})
				})
			}catch(e){
				continue;
			}
		}
		if ( entityInfoB.type == 'player' ) {
			entityB = $.entities[entityInfoB.id];
		} else if ( entityInfoB.type == 'petal' ) {
			const player = $.entities[entityInfoB.id.playerID];
			if ( !player )
				continue;
			try{
				player.petals.forEach(petals => {
					petals.forEach(petal => {
						if (petal.id == entityInfoB.id.petalID) {
							if (petal.inCooldown) {
								throw Error();
							} else{
								entityB = petal;
							}
						}
					})
				})
			}catch(e){
				continue;
			}
		}
		if (!entityA || !entityB) continue;
		
		const distance = entityA.distanceTo(entityB);
		const r1 = entityA.attributes.RADIUS, r2 = entityB.attributes.RADIUS;
		const depth = r1 + r2 - distance;
		const mA = entityA.attributes.MASS, mB = entityB.attributes.MASS;
		const theta2 = Math.atan2(entityA.x - entityB.x, entityB.y - entityA.y); // orientation of A relative to B
		const theta1 = theta2 - Math.PI; // orientation of B relative to A
		const penetrationDepthWeightInCollision = Constants.PENETRATION_DEPTH_WEIGHT_IN_COLLISION;
		const velA = depth * penetrationDepthWeightInCollision * mB / (mA + mB);
		const velB = depth * penetrationDepthWeightInCollision * mA / (mA + mB);
		entityA.constraintVelocity.x += velA * Math.sin(theta2) / dt;
		entityA.constraintVelocity.y += velA * Math.cos(theta2) / dt;
		entityB.constraintVelocity.x += velB * Math.sin(theta1) / dt;
		entityB.constraintVelocity.y += velB * Math.cos(theta1) / dt;
		
		if ( entityA.team != entityB.team ) {
			if ( entityInfoA.type == 'player' ) {
				entityA.velocity.x += velA * Math.sin(theta2) / dt;
				entityA.velocity.y += velA * Math.cos(theta2) / dt;
				const baseKnockback = Constants.BASE_KNOCKBACK;
				const knockbackA = baseKnockback * mB / (mA + mB);
				entityA.velocity.x += knockbackA * Math.sin(theta2);
				entityA.velocity.y += knockbackA * Math.cos(theta2);
				if ( entityInfoB.type == 'petal' ) {
					$.entities[entityB.parent].hp -= entityB.attributes.DAMAGE * entityA.damageReflect * (1 + entityB.fragile);
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
				entityB.velocity.x += velB * Math.sin(theta1) / dt;
				entityB.velocity.y += velB * Math.cos(theta1) / dt;
				const baseKnockback = Constants.BASE_KNOCKBACK;
				const knockbackB = baseKnockback * mA / (mA + mB);
				entityB.velocity.x += knockbackB * Math.sin(theta1);
				entityB.velocity.y += knockbackB * Math.cos(theta1);
				if ( entityInfoA.type == 'petal' ) {
					$.entities[entityA.parent].hp -= entityA.attributes.DAMAGE * entityB.damageReflect * (1 + entityA.fragile);
				}
			}

			const dmgA = entityB.attributes.DAMAGE * (1 + entityA.fragile);
			const dmgB = entityA.attributes.DAMAGE * (1 + entityB.fragile);
			
			//第一个if是吸血相关的
			if (!entityA.segments.includes(entityB.id) && !entityB.segments.includes(entityA.id) || !(entityA.attributes.TRIGGERS.VAMPIRISM || entityB.attributes.TRIGGERS.VAMPIRISM)) {
				if ( dmgA != 0 ) {
					entityA.isHurt = true;
				}
				if ( dmgB != 0 ) {
					entityB.isHurt = true;
				}
				if (entityA.hpConnection) {
					// this.getEntity(entityA.hpConnection).hp -= dmgA;
				} else {
					entityA.hp -= dmgA;
				}
				if (entityB.hpConnection) {
					// this.getEntity(entityB.hpConnection).hp -= dmgB;
				} else {
					entityB.hp -= dmgB;
				}
			}

			releaseCollisionSkill.bind(this)(entityA,entityB,entityInfoB);
			releaseCollisionSkill.bind(this)(entityB,entityA,entityInfoA);
		}
	}
}

function releaseCollisionSkill(entityA,entityB,entityInfo) {
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
		// if ( entityB.attributes.TRIGGERS.LIGHTNING && entityB.attributes.TRIGGERS.LIGHTNING.COLLIDE ) {
		// 	this.lightning(entityB, entityA, entityInfo);
		// }
		// if (entityB.attributes.TRIGGERS.VAMPIRISM) {
		// 	if (entityB.attributes.TRIGGERS.VAMPIRISM.COLLIDE) {
		// 		entityB.hp = Math.min(entityB.maxHp, entityB.hp + entityB.attributes.DAMAGE * entityB.attributes.TRIGGERS.VAMPIRISM.HEAL);
		// 		entityA.isHurt = true;
		// 		if (entityB.attributes.TRIGGERS.VAMPIRISM.HEAL_PLAYER) {
		// 			const player = this.getEntity(entityInfo.id.playerID);
		// 			player.hp = Math.min(player.maxHp, player.hp + entityB.attributes.DAMAGE * entityB.attributes.TRIGGERS.VAMPIRISM.HEAL_PLAYER);
		// 		}
		// 	} 
		// 	else if (entityB.target == entityA.id) {
		// 		entityB.bodyConnection = entityA.id;
		// 		entityB.segments.push(entityA.id);
		// 	}
		// }
	}
	
	// if (entityA.attributes.CONTENT_RELEASE) {
	// 	if (entityA.attributes.CONTENT_RELEASE.ONHIT) {
	// 		const releases = entityA.attributes.CONTENT_RELEASE.ONHIT;
	// 		const contents = entityA.attributes.CONTENT;
	// 		const correctTimes = Math.floor((entityA.maxHp - entityA.hp) / releases.HP);
			
	// 		if (correctTimes > releases.TIMES) {
	// 			releases.TIMES = correctTimes;
				
	// 			Object.entries(releases.RELEASE).forEach(([type, number]) => {
	// 				const isContentProjectile = EntityAttributes[type].ATTACK_MODE == `PROJECTILE` ? true : false;
	// 				for (let time = 0; time < number; time++) {
	// 					if (contents[type] <= 0) break;
	// 					const newMob = this.spawnMob(type, entityA.x, entityA.y, entityA.team, isContentProjectile, isContentProjectile ? Constants.PROJECTILE_EXIST_TIME : Infinity);
	// 					if (entityA.team != `mobTeam`) {
	// 						const player = this.getEntity(entityA.team);
	// 						newMob.slot = entityA.slot;
	// 						newMob.petalID = entityA.petalID;
	// 						player.pets[newMob.id] = newMob;
	// 						player.petals.some(petals => {
	// 							const petal = petals.find(petal => petal.id == newMob.petalID);
	// 							if (petal) {
	// 								petal.mob.push(newMob.id);
	// 								return true;
	// 							}
	// 						})
	// 					}
	// 					contents[type]--;
	// 				}
	// 			})
	// 		}
	// 	}
	// }
	
	if (entityA.puncture > 0) {
		entityA.puncture--;
	}
	if (entityA.puncture == 0) {
		entityA.fragile = 0;
	}
	
	if (entityB.attributes.ATTACK_MODE == `PROJECTILE`) {
		entityA.hurtByInfo = {type: entityInfo.type, id: entityB.shootBy};
		return;
	}
	entityA.hurtByInfo = entityInfo;
}

function applyConstraintVelocity(dt) {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		$.entities[id].applyConstraintVelocity(dt);
	});
}

export {
	init,
	updateMovement,
	updateVelocity,
	handleBorder,
	updatePlayers,
	updateChunks,
	getChunkID,
	solveCollisions,
	applyConstraintVelocity,
};