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
	initPetals.bind(newPlayer)($.props.default_kit_info);
}

function updatePlayers() {
	const $ = this.var;
	Object.values($.players).map(uuid => $.entities[uuid]).forEach(player => {

	});
}

function initPetals(defaultKitInfo) { // Player 调用
	const $ = this.var;
	$.kit = {};
}

/*
概念定义
抽象花瓣：玩家可以获取的，非实体的花瓣
实体花瓣：有碰撞箱的实体花瓣
loadout：一行抽象花瓣的集合
kit：主副 loadout 的集合
绑定：实体花瓣一般绑定到生成它的抽象花瓣
当该实体花瓣脱离其抽象花瓣且不影响所属抽象花瓣生成新的实体花瓣时解绑
例如：导弹发射，花粉放置

kit: {size, primary:[{id, attr, instances:[uuid]}], secondary:[{id, attr}]}
记录 loadout size, 主副 loadout 抽象花瓣的 id, attr

petals: [uuid]
记录已解绑实体花瓣的 uuid
*/

function handlePlayerDeath(player) {
	const $ = this.var;
	player.setSpec(true);
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
	handlePlayerDeath,
	getUpdate,
};