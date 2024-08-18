export default class Game {
	var = {
		isStarted: false, 
		isOver: false,
		tick: 0, // 游戏刻计数
		ended: false,
		stopped: false,
	}
	
	handlePlayerInput(socketID, type, input) {
		const $ = this.var;
		const player = $.entities[$.players[socketID]];
		if ( type == 0 ) { // 鼠标移动
			entityHandler.move.bind(player)(input.dir, input.power * player.var.attr.speed);
		} else if ( type == 1 ) { // 鼠标按下/松开
			player.var.state = input;
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
			mspt: Date.now() - this.var.time.lastUpdTime, // mspt
			self: entityHandler.getUpdate.bind(player)(),
			entities: nearbyEntities.map(e => entityHandler.getUpdate.bind(e)()), // 视距内实体
		};
	}
}