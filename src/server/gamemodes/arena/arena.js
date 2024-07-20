import properties from './properties.js'; // 游戏相关设置
import * as time from '../../game/time.js'; // 时间相关方法
import * as playerHandler from '../../game/playerHandler.js';
import * as entityHandler from '../../game/entityHandler.js';
import * as physics from '../../game/physics.js';
import Constants from '../../../shared/constants.js';

class Game_Arena {
	constructor(settings) {
		this.var = {};
		this.init(settings);
	}

	init(settings) {
		this.var.props = properties;
		time.init.bind(this)();
		playerHandler.init.bind(this)();
		entityHandler.init.bind(this)();
		physics.init.bind(this)();
	}

	start() { // 开始游戏
		setInterval(this.update.bind(this), 1000 / this.var.props.tick_per_second); // 开启游戏主循环
	}

	update() {
		time.update.bind(this)();
		// const dt = this.var.time.dt;
		const dt = 1 / this.var.props.tick_per_second;
		physics.updateMovement.bind(this)(dt);
		physics.updateVelocity.bind(this)(dt);
		physics.handleBorder.bind(this)();
		physics.updatePlayers.bind(this)(dt);
		physics.updateChunks.bind(this)();
		physics.solveCollisions.bind(this)(dt);
		physics.applyConstraintVelocity.bind(this)(dt);
		physics.handleBorder.bind(this)();
		playerHandler.handlePlayerDeaths.bind(this)();
		this.sendUpdate();
	}

	addPlayer(socket, username, team) {
		playerHandler.addPlayer.bind(this)(socket, username, team);
	}

	sendUpdate() {
		const $ = this.var;
		Object.keys($.sockets).forEach(socketID => {
			const socket = $.sockets[socketID];
			const player = $.entities[$.players[socketID]];
			socket.emit(Constants.MSG_TYPES.SERVER.GAME.UPDATE, this.createUpdate(player));
		});
	}

	createUpdate(player) {
		const $ = this.var;
		const nearbyPlayers = Object.values($.players).map(id => $.entities[id]).filter(
			p => {
				return p !== player && p.distanceTo(player) <= $.props.nearby_distance;
			}
		);

		return {
			t: Date.now(), // current time
			// info: this.info,
			// leaderboard: this.leaderboard.slice(0, Constants.LEADERBOARD_LENGTH + 1), // leaderboard
			// rankOnLeaderboard: this.getRankOnLeaderboard(player.id), // this player's rank on leaderboard
			me: player.serializeForUpdate(true), // this player
			others: nearbyPlayers.map(p => p.serializeForUpdate(false)), // nearby players
			playerCount: Object.keys($.players).length, // the number of players online
			// mobs: nearbyMobs.map(e => e.serializeForUpdate()),
			// drops: nearbyDrops.map(e => e.serializeForUpdate()),
			// lightningPath: this.lightningPath,
			// diedEntities: this.diedEntities,
		};
	}
}

export default Game_Arena;