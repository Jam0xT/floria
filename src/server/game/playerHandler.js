import * as util from './utility.js';
import Player from './player.js';
import * as entityHandler from './entityHandler.js';
import mobAttr from './mobAttr.js';

/*
处理玩家

$ = this.var

$.sockets: {socket id -> socket}
$.players: {socket id -> uuid}
*/

function init() { // 初始化
	const $ = this.var;
	$.sockets = {};
	$.players = {};
}

function addPlayer(socket, username, team) { // 添加玩家
	const $ = this.var;
	$.sockets[socket.id] = socket; // 储存 socket
	const x = util.randomInt(0, $.props.map_width); // 生成随机出生点
	const y = util.randomInt(0, $.props.map_height);
	const newPlayer = new Player( // 创建新 Player 实例
		socket.id,
		username,
		x, y,
		team,
		mobAttr.player,
		$.props.default_petals,
	);
	const uuid = newPlayer.var.uuid; // 获取 uuid
	$.players[socket.id] = uuid; // 储存 uuid
	entityHandler.addEntity.bind(this)(uuid, newPlayer); // 添加实体到实体列表
}

function updatePlayers() {
	const $ = this.var;
	Object.values($.players).map(uuid => $.entities[uuid]).forEach(player => {

	});
}

function getUpdate() { // Player 调用
	const $ = this.var;
	return {
		uuid: $.uuid,
		x: $.pos.x,
		y: $.pos.y,
		username: $.playerInfo.usrename,
		attr: $.attr,
	};
}

export {
	init,
	addPlayer,
	updatePlayers,
	getUpdate,
};