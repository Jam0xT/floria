const EntityAttributes = require('../../public/entity_attributes');
const Constants = require('../shared/constants');

function applyCollisions(players, mobs, chunks) {
	const hurtPlayers = [];
	const hurtMobs = [];
	Object.values(chunks).forEach(entitiesInChunk => {
		const entityCount = entitiesInChunk.length;
		if ( entityCount <= 1 )
			return ;
		
		for (let i = 0; i < entityCount - 1; i++) {
			for (let j = i + 1; j < entityCount; j++) {
				const entityInfoA = entitiesInChunk[i];
				const entityInfoB = entitiesInChunk[j];
				if ( entityInfoA.type == 'player' ) {
					const player = players[entityInfoA.id];
					if ( entityInfoB.type == 'player' ) {
						const playerB = players[entityInfoB.id];
						if ( player.distanceTo(playerB) <= EntityAttributes.PLAYER.RADIUS * 2) {
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
						if ( player.distanceTo(mob.value) <= EntityAttributes[mob.type].RADIUS + EntityAttributes.PLAYER.RADIUS) {
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
					}
				} else if ( entityInfoA.type == 'mob' ) {
					const mob = mobs[entityInfoA.id];
					if ( entityInfoB.type == 'mob' ) {
						const mobB = mobs[entityInfoB.id];
						if ( mob.value.distanceTo(mobB.value) <= EntityAttributes[mob.type].RADIUS + EntityAttributes[mobB.type].RADIUS) {
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
					}
				}
			}
		}
	});
	return {
		hurtPlayers: hurtPlayers,
		hurtMobs: hurtMobs,
	};
}

module.exports = applyCollisions;
