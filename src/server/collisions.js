const EntityAttributes = require('../../public/entity_attributes');

function applyPlayerCollisions(players) {
	const hurtPlayers = [];
	const playersID = Object.keys(players);
	for (let i = 0; i < playersID.length; i++) {
		for(let j = 0; j < playersID.length; j++) {
			if ( i !== j ) {
				const playerA = players[playersID[i]];
				const playerB = players[playersID[j]];
				if ( playerA.distanceTo(playerB) <= EntityAttributes.PLAYER.RADIUS * 2 && playerA.hurtTime == -1) {
					hurtPlayers.push({
						playerID: playersID[i],
						hurtBy: playersID[j],
						knockbackDirection: Math.atan2(playerA.x - playerB.x, playerB.y - playerA.y),
					});
					break;
				}
			}
		}
	}
	return hurtPlayers;
}

module.exports = applyPlayerCollisions;