import * as time from '../../game/time.js'; // 时间相关方法
import * as playerHandler from '../../game/playerHandler.js';
import * as entityHandler from '../../game/entityHandler.js';
import * as physics from '../../game/physics.js';
import Constants from '../../../shared/constants.js';
import * as util from '../../game/utility.js';

class Game_Arena {
	constructor(settings) {
		this.var = {isStarted: false, isOver: false};
		this.init(settings);
	}

	init(settings) {
		this.var.props = settings;
		time.init.bind(this)();
		playerHandler.init.bind(this)();
		entityHandler.init.bind(this)();
		physics.init.bind(this)();
	}

	start() { // 开始游戏
		this.var.isStarted = true; // 表示游戏开始
		this.var.intervalID = setInterval(this.update.bind(this), 1000 / this.var.props.tick_per_second); // 开启游戏主循环
	}

	stop() { // 停止游戏
		clearInterval(this.var.intervalID); // 停止主循环
	}

	update() {
		// console.log('upd');
		time.update.bind(this)();
		const dt = 1 / this.var.props.tick_per_second;
		playerHandler.updatePlayers.bind(this)(); // 更新玩家
		entityHandler.updateAcceleration.bind(this)(dt); // 更新加速度
		entityHandler.updateVelocity.bind(this)(dt); // 更新速度
		entityHandler.updatePosition.bind(this)(dt); // 更新位置
		physics.updateChunks.bind(this)(); // 更新区块信息
		physics.solveCollisions.bind(this)(dt); // 计算碰撞
		entityHandler.updatePosition.bind(this)(dt); // 更新位置
		physics.solveBorderCollisions.bind(this)(); // 处理边界碰撞
		entityHandler.handleEntityDeaths.bind(this)(); // 处理实体死亡
		this.checkGameOver();
		this.sendUpdate();
	}

	checkGameOver() {

	}

	handlePlayerInput(socketID, type, input) {
		const $ = this.var;
		const player = $.entities[$.players[socketID]];
		if ( type == 0 ) {
			entityHandler.move.bind(player)(input.dir, input.power * player.var.attr.speed);
		}
	}

	addPlayer(socket, username, team) {
		playerHandler.addPlayer.bind(this)(socket, username, team);
	}

	sendUpdate() {
		const $ = this.var;
		Object.keys($.sockets).forEach(socketID => {
			const socket = $.sockets[socketID];
			const player = $.entities[$.players[socketID]];
			const update = this.createUpdate(player);
			socket.emit(Constants.MSG_TYPES.SERVER.GAME.UPDATE, update);
		});
	}

	createUpdate(player) {
		const $ = this.var;
		const d = player.var.attr.vision; // 视距
		const nearbyEntities = Object.values($.entities).filter(e => ((e.var.uuid != player.var.uuid) && (util.getDistance(e.var.pos, player.var.pos) <= d)));

		return {
			t: Date.now(), // current time
			self: entityHandler.getUpdate.bind(player)(),
			entities: nearbyEntities.map(e => entityHandler.getUpdate.bind(e)()), // 视距内实体
		};
	}
}

export default Game_Arena;