const EntityAttributes = require('../../public/entity_attributes');
const PetalAttributes = require('../../public/petal_attributes');
const Constants = require('../shared/constants');

function applyCollisions(players, mobs, chunks) {
	const hurtPlayers = [];
	const hurtMobs = [];
	const hurtPetals = {};
	Object.values(chunks).forEach(entitiesInChunk => {
		const entityCount = entitiesInChunk.length;
		if ( entityCount <= 1 )
			return ;
		for (let i = 0; i < entityCount - 1; i++) {
			for (let j = i + 1; j < entityCount; j++) {
				var entityInfoA = entitiesInChunk[i];
				var entityInfoB = entitiesInChunk[j];
				if ( entityInfoA.type == 'mob' && entityInfoB.type == 'player' ||
					entityInfoA.type == 'petal' && entityInfoB.type == 'player' ||
					entityInfoA.type == 'petal' && entityInfoB.type == 'mob') {
					[entityInfoA, entityInfoB] = [entityInfoB, entityInfoA];
				}
				if ( entityInfoA.type == 'player' ) {
					const player = players[entityInfoA.id];
					if ( entityInfoB.type == 'player' ) {
						const playerB = players[entityInfoB.id];
						if ( player.distanceTo(playerB) <= EntityAttributes.PLAYER.RADIUS * 2 ) {
							if ( player.hurtTime == -1 ) {
								hurtPlayers.push({
									entityID: entityInfoA.id,
									sourceInfo: entityInfoB,
									knockbackDirection: Math.atan2(player.x - playerB.x, playerB.y - player.y),
								});
							}
							if ( playerB.hurtTime == -1 ) {
								hurtPlayers.push({
									entityID: entityInfoB.id,
									sourceInfo: entityInfoA,
									knockbackDirection: Math.atan2(playerB.x - player.x, player.y - playerB.y),
								});
							}
						}
					} else if ( entityInfoB.type == 'mob' ) {
						const mob = mobs[entityInfoB.id];
						if ( player.distanceTo(mob.value) <= EntityAttributes[mob.type].RADIUS + EntityAttributes.PLAYER.RADIUS ) {
							// hurt: 'player', source: 'mob'
							// hurt: 'mob', source: 'player'
							if ( player.hurtTime == -1 ) {
								hurtPlayers.push({
									entityID: entityInfoA.id,
									sourceInfo: entityInfoB,
									knockbackDirection: Math.atan2(player.x - mob.value.x, mob.value.y - player.y),
								});
							}
							if ( mob.value.hurtTime == -1 ) {
								hurtMobs.push({
									entityID: entityInfoB.id,
									sourceInfo: entityInfoA,
									knockbackDirection: Math.atan2(mob.value.x - player.x, player.y - mob.value.y),
								});
							}
						}
					} else if ( entityInfoB.type == 'petal' ) {
						if ( entityInfoB.id.playerID != entityInfoA.id ) {
							const petal = players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
							if ( player.distanceTo(petal) <= PetalAttributes[petal.type].RADIUS + EntityAttributes.PLAYER.RADIUS ) {
								if ( player.hurtTime == -1 ) {
									hurtPlayers.push({
										entityID: entityInfoA.id,
										sourceInfo: entityInfoB,
										knockbackDirection: Math.atan2(player.x - petal.x, petal.y - player.y),
									});
								}
								if ( petal.hurtTime == -1 ) {
									if ( !hurtPetals[petal.parent] ) {
										hurtPetals[petal.parent] = [];
									}
									hurtPetals[petal.parent].push({
										petalID: petal.id,
										sourceInfo: entityInfoA,
										knockbackDirection: Math.atan2(petal.x - player.x, player.y - petal.y),
									});
								}
							}
						}
					}
				} else if ( entityInfoA.type == 'mob' ) {
					const mob = mobs[entityInfoA.id];
					if ( entityInfoB.type == 'mob' ) {
						const mobB = mobs[entityInfoB.id];
						if ( mob.value.distanceTo(mobB.value) <= EntityAttributes[mob.type].RADIUS + EntityAttributes[mobB.type].RADIUS ) {
							// hurt: 'player', source: 'mob'
							// hurt: 'mob', source: 'player'
							if ( mob.value.hurtTime == -1 ) {
								hurtMobs.push({
									entityID: entityInfoA.id,
									sourceInfo: entityInfoB,
									knockbackDirection: Math.atan2(mob.value.x - mobB.value.x, mobB.value.y - mob.value.y),
								});
							}
							if ( mobB.value.hurtTime == -1 ) {
								hurtMobs.push({
									entityID: entityInfoB.id,
									sourceInfo: entityInfoA,
									knockbackDirection: Math.atan2(mobB.value.x - mob.value.x, mob.value.y - mobB.value.y),
								});
							}
						}
					} else if ( entityInfoB.type == 'petal' ) {
						const petal = players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
						if ( mob.value.distanceTo(petal) <= EntityAttributes[mob.type].RADIUS + PetalAttributes[petal.type].RADIUS ) {
							if ( mob.value.hurtTime == -1 ) {
								hurtMobs.push({
									entityID: entityInfoA.id,
									sourceInfo: entityInfoB,
									knockbackDirection: Math.atan2(mob.value.x - petal.x, petal.y - mob.value.y),
								});
							}
							if ( petal.hurtTime == -1 ) {
								if ( !hurtPetals[petal.parent] ) {
									hurtPetals[petal.parent] = [];
								}
								hurtPetals[petal.parent].push({
									petalID: petal.id,
									sourceInfo: entityInfoA,
									knockbackDirection: Math.atan2(petal.x - mob.value.x, mob.value.y - petal.y),
								});
							}
						}
					}
				} else if ( entityInfoA.type == 'petal' ) {
					const petal = players[entityInfoA.id.playerID].petals[entityInfoA.id.petalID];
					if ( entityInfoB.type == 'petal' ) {
						if ( entityInfoB.id.playerID != entityInfoA.id.playerID ) {
							const petalB = players[entityInfoB.id.playerID].petals[entityInfoB.id.petalID];
							if ( petal.distanceTo(petalB) <= PetalAttributes[petal.type].RADIUS + PetalAttributes[petalB.type].RADIUS ) {
								if ( petal.hurtTime == -1 ) {
									if ( !hurtPetals[petal.parent] ) {
										hurtPetals[petal.parent] = [];
									}
									hurtPetals[petal.parent].push({
										petalID: petal.id,
										sourceInfo: entityInfoB,
										knockbackDirection: Math.atan2(petal.x - petalB.x, petalB.y - petal.y),
									});
								}
								if ( petalB.hurtTime == -1 ) {
									if ( !hurtPetals[petalB.parent] ) {
										hurtPetals[petalB.parent] = [];
									}
									hurtPetals[petalB.parent].push({
										petalID: petalB.id,
										sourceInfo: entityInfoA,
										knockbackDirection: Math.atan2(petalB.x - petal.x, petal.y - petalB.y),
									});
								}
							}
						}
					}
				}
			}
		}
	});
	return {
		hurtPlayers: hurtPlayers,
		hurtMobs: hurtMobs,
		hurtPetals: hurtPetals,
	};
}

module.exports = applyCollisions;
