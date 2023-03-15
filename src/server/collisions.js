const EntityAttributes = require('../../public/entity_attributes');
const Constants = require('../shared/constants');


function applyCollisions(players, mobs, chunks) {
	const hurtPlayers = [];
	const hurtMobs = [];
	const playersID = Object.keys(players);
	for (let i = 0; i < playersID.length; i++) {
		const player = players[playersID[i]];
		const playerChunks = player.chunks;
		playerChunks.forEach(playerChunk => {
			const chunkX = playerChunk.x, chunkY = playerChunk.y;
			const entitiesInChunk = chunks[(chunkX * Constants.CHUNK_ID_CONSTANT + chunkY)];
			if ( entitiesInChunk ) {
				// console.log(chunkX, chunkY, entitiesInChunk);
				entitiesInChunk.forEach(entityInfo => {
					const {type, id} = entityInfo;
					if ( type == 'player' ) {
						if ( id != playersID[i] && player.distanceTo(players[id]) <= EntityAttributes.PLAYER.RADIUS * 2 && player.hurtTime == -1) {
							// hurt: 'player', source: 'players[id]'
							hurtPlayers.push({
								entityID: playersID[i],
								sourceInfo: entityInfo,
								knockbackDirection: Math.atan2(player.x - players[id].x, players[id].y - player.y),
							});
						}
					} else if ( type == 'mob' ) {
						const mob = mobs[id];
						if ( player.distanceTo(mob.value) <= EntityAttributes[mob.type].RADIUS + EntityAttributes.PLAYER.RADIUS) {
							// hurt: 'player', source: 'mob'
							// hurt: 'mob', source: 'player'
							if ( player.hurtTime == -1 ) {
								hurtPlayers.push({
									entityID: playersID[i],
									sourceInfo: entityInfo,
									knockbackDirection: Math.atan2(player.x - mob.value.x, mob.value.y - player.y),
								});
							}
							if ( mob.value.hurtTime == -1 ) {
								hurtMobs.push({
									entityID: id,
									sourceInfo: {
										type: 'player',
										id: playersID[i],
									},
									knockbackDirection: Math.atan2(mob.value.x - player.x, player.y - mob.value.y),
								});
							}
						}
					}
				});
			}
		});
	}
	return {
		hurtPlayers: hurtPlayers, 
		hurtMobs: hurtMobs,
	};
}

module.exports = applyCollisions;