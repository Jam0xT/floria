const EntityAttributes = require('../../public/entity_attributes');
const Constants = require('../shared/constants');


function applyCollisions(players, entities, chunks) {
	const hurtPlayers = [];
	const hurtEntities = [];
	const playersID = Object.keys(players);
	for (let i = 0; i < playersID.length; i++) {
		const player = players[playersID[i]];
		const playerChunk = player.chunk;
		for(let chunkX = playerChunk.x - 1; chunkX <= playerChunk.x + 1; chunkX ++) {
			for(let chunkY = playerChunk.y - 1; chunkY <= playerChunk.y + 1; chunkY ++) {
				const entitiesInChunk = chunks[(chunkX * Constants.CHUNK_ID_CONSTANT + chunkY)];
				if ( entitiesInChunk ) {
					// console.log(chunkX, chunkY, entitiesInChunk);
					entitiesInChunk.forEach(entityInfo => {
						const {type, id} = entityInfo;
						if ( type == 'player' ) {
							if ( id != playersID[i] ) {
								// console.log(id);
								if ( player.distanceTo(players[id]) <= EntityAttributes.PLAYER.RADIUS * 2 && player.hurtTime == -1) {
									// hurt: 'player', source: 'players[id]'
									hurtPlayers.push({
										entityID: playersID[i],
										sourceInfo: entityInfo,
										knockbackDirection: Math.atan2(player.x - players[id].x, players[id].y - player.y),
									});
								}
							}
						} else if ( type == 'mob' ) {
							const entity = entities[id];
							if ( player.distanceTo(entity.mob) <= EntityAttributes[entity.type].RADIUS + EntityAttributes.PLAYER.RADIUS) {
								// hurt: 'player', source: 'mob'
								// hurt: 'mob', source: 'player'
								if ( player.hurtTime == -1 ) {
									hurtPlayers.push({
										entityID: playersID[i],
										sourceInfo: entityInfo,
										knockbackDirection: Math.atan2(player.x - entity.mob.x, entity.mob.y - player.y),
									});
								}
								if ( entity.mob.hurtTime == -1 ) {
									hurtEntities.push({
										entityID: id,
										sourceInfo: {
											type: 'player',
											id: playersID[i],
										},
										knockbackDirection: Math.atan2(entity.mob.x - player.x, player.y - entity.mob.y),
									});
								}
							}
						}
					});
				}
			}
		}
	}
	return {
		hurtPlayers: hurtPlayers, 
		hurtEntities: hurtEntities,
	};
}

module.exports = applyCollisions;
