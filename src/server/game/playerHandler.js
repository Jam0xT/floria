import * as util from './utility.js';
import Player from './entity/player.js';
import * as entityHandler from './entityHandler.js';
import Constants from '../../shared/constants.js';
import * as physics from './physics.js';

/*
处理玩家

$ = this.var

$.sockets: {socket id -> socket}
$.players: {socket id -> entity id}
*/

function init() {
	const $ = this.var;
	$.sockets = {};
	$.players = {};
}

function addPlayer(socket, username, team) { // 添加玩家
	const $ = this.var;
	$.sockets[socket.id] = socket; // 储存 socket
	const id = util.newUUID(); // 生成 entity id
	$.players[socket.id] = id; // 储存 entity id
	const x = util.randomInt(0, $.props.map_width); // 生成随机出生点
	const y = util.randomInt(0, $.props.map_height);
	entityHandler.addEntity.bind(this)( // 添加实体到实体列表
		id, 
		new Player( // 新建玩家类
			id, // 实体 id
			socket.id, // socket id
			username, // 用户名
			x, y, // 初始坐标
			team, // 所在队伍
		)
	);
}

function removePlayer(socket) {
	const $ = this.var;
	const playerID = $.players[socket.id];
	$.entities[playerID].chunks.forEach(chunk => {
		if ( $.chunks[physics.getChunkID(chunk)] ) {
			$.chunks[physics.getChunkID(chunk)].splice(
				$.chunks[physics.getChunkID(chunk)].findIndex((entityInChunk) => {
					return entityInChunk.type == 'player' && entityInChunk.id == playerID;
				}),
				1
			);
		}
	});
	$.entities[playerID].petals.forEach((petals) => {
		petals.forEach((petal) => {
			// if ( petal.mob && petal.isHide ) {
			// 	petal.mob.forEach(mobID => {
			// 		delete this.mobs[mobID];
			// 	})
			// }
			if ( !petal.inCooldown ) {
				petal.chunks.forEach(chunk => {
					if ( $.chunks[physics.getChunkID(chunk)] ) {
						$.chunks[physics.getChunkID(chunk)].splice(
							$.chunks[physics.getChunkID(chunk)].findIndex((entityInChunk) => {
								return entityInChunk.type == 'petal' && entityInChunk.id == {playerID: playerID, petalID: petal.id};
							}),
							1
						);
					}
				});
			}
		})
	})
	delete $.sockets[socket.id];
	delete $.players[socket.id];
	delete $.entities[playerID];

}

function handlePlayerDeath(player) {
	// const $ = this.var;
	// const killedByInfo = player.hurtByInfo;
	// if ( killedByInfo.type == 'player' || killedByInfo.type == 'petal' ) {
	// 	var killedBy;
	// 	if ( killedByInfo.type == 'player' ) {
	// 		killedBy = this.players[killedByInfo.id];
	// 	} else if ( killedByInfo.type == 'petal' ) {
	// 		killedBy = this.players[killedByInfo.id.playerID];
	// 	}
	// 	if ( killedBy ) {
	// 		killedBy.score += Math.floor(EntityAttributes.PLAYER + player.score * Constants.SCORE_LOOTING_COEFFICIENT);
	// 		killedBy.addExp(EntityAttributes.PLAYER.EXPERIENCE + player.totalExp * Constants.EXP_LOOTING_COEFFICIENT);
	// 		// if ( this.getRankOnLeaderboard(killedBy.id) > 0 ) {
	// 		// 	// avoid crashing when two players kill each other at the exact same time
	// 		// 	// it will crash because the player who killed you is not on the leaderboard anymore
	// 		// 	// (the player who killed you is dead, and he has already been removed from leaderboard)
	// 		// 	this.updateLeaderboard(killedBy);
	// 		// 	killedBy.maxHp += 10;
	// 		// }
	// 	}
	// }
	// // this.removeFromLeaderboard(player);
	// // console.log(`${player.username} is dead!`);
}

function handlePetalDeaths(player) {
	const $ = this.var;
	player.petals.forEach((petals, slot) => {
		petals.forEach((petal,index) => {
			if ( !petal.inCooldown ) {
				if ( petal.hp <= 0 ) {
					// this.diedEntities.push({
					// 	x: petal.x,
					// 	y: petal.y,
					// 	vdir: Math.atan2(petal.velocity.y, petal.velocity.x),
					// 	type: petal.type,
					// 	size: petal.attributes.RADIUS * petal.attributes.RENDER_RADIUS,
					// 	dir: petal.direction,
					// });
					petal.chunks.forEach(chunk => {
						if ( $.chunks[physics.getChunkID(chunk)] ) {
							$.chunks[physics.getChunkID(chunk)].splice(
								$.chunks[physics.getChunkID(chunk)].findIndex((entityInChunk) => {
									return entityInChunk.type == 'petal' && entityInChunk.id == {playerID: player.id, petalID: petal.id};
								}),
								1
							);
						}
					});
					if ( petal.placeHolder != -1 ) {
						petal.inCooldown = true;
						player.reload(petal.slot,index);
						return;
					}
					player.petals.splice(slot, 1);
				}
			}
		})
	});
}

function handlePlayerDeaths() {
	const $ = this.var;
	Object.values($.players).forEach(id => {
		const player = $.entities[id];
		handlePetalDeaths.bind(this)(player);
		if ( player.hp <= 0 ) {
			handlePlayerDeath.bind(this)(player);
		}
	});

	Object.keys($.sockets).forEach(socketID => {
		const socket = $.sockets[socketID];
		const player = $.entities[$.players[socketID]];
		if ( player.hp <= 0 ) {
			socket.emit(Constants.MSG_TYPES.SERVER.GAME.OVER);
			removePlayer.bind(this)(socket);
		}
	});
}

export {
	init,
	addPlayer,
	handlePlayerDeaths,
};