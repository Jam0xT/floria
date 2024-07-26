import * as util from './utility.js';
import Player from './player.js';
import * as entityHandler from './entityHandler.js';
import mobAttr from './mobAttr.js';
import petalAttr from './petalAttr.js';
import petalInfo from './petalInfo.js';
import Petal from './petal.js';

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
		structuredClone(mobAttr.player),
	);
	const uuid = newPlayer.var.uuid;	// 获取 uuid
	$.players[socket.id] = uuid;		// 储存 uuid
	entityHandler.addEntity.bind(this)(uuid, newPlayer);	// 添加实体到实体列表
	initPetals.bind(newPlayer)($.props.default_kit_info);	// 初始化花瓣相关信息
}

function playerNaturalRegen(player) { // 玩家自然会血
	const $ = this.var;
	if ( $.tick % $.props.player_natural_regen.interval )
		return ;
	player.var.attr.hp = Math.min(player.var.attr.max_hp, player.var.attr.hp + $.props.player_natural_regen.point + $.propr.player_natural_regen.percent * player.var.attr.max_hp);
}

function updatePlayers() { // Game 调用 更新玩家
	const $ = this.var;
	Object.values($.players).map(uuid => $.entities[uuid]).forEach(player => { // 遍历玩家
		if ( player.var.spec ) { // 玩家是观察者
			return ;
		}

		playerNaturalRegen.bind(this)(player);

		player.var.angle = (player.var.angle + player.var.attr.rot_speed) % (Math.PI * 2); // 更新轨道起始角度
		const kit = player.var.kit;
		let clusterCnt = 0; // 花瓣簇数 聚合算 1 分散算 n

		kit.primary.forEach((data, idx) => { // 遍历抽象花瓣 更新冷却
			const id = data.id; // 抽象花瓣 id
			if ( !id ) 			// 空花瓣
				return ;
			const info = data.info; 			// 抽象花瓣信息
			const instances = data.instances; 	// 实例列表

			clusterCnt += ((info.pattern == 0) ? info.count : 1); // 花瓣簇计数

			for (let subidx = 0; subidx < info.count; subidx ++ ) { // 遍历实例 更新 冷却时间
				if ( !instances[subidx] ) { 	// 如果实例不存在 即 在冷却时间
					info.cd_remain[subidx] --; 	// 更新冷却时间
					if ( info.cd_remain[subidx] <= 0 ) { 	// 冷却时间结束
						const newPetal = new Petal( 		// 创建新 Petal 实例
							info.instance_id, 				// 获取实例 id
							player.var.uuid, 	// 设置玩家为 parent
							idx, 				// 所属抽象花瓣的编号
							subidx,				// 在所属抽象花瓣的实例集合中的编号
							player.var.pos.x, player.var.pos.y, // 继承玩家的位置
							player.var.team,	// 继承玩家的所在队伍
							structuredClone(petalAttr[info.instance_id]),	// 默认属性
						);
						const uuid = newPetal.var.uuid; // 获取新花瓣 uuid
						instances[subidx] = uuid; 		// 储存 uuid
						entityHandler.addEntity.bind(this)(uuid, newPetal); // 添加实体到实体列表
					}
				}
			}
		});

		kit.primary.forEach((data, idx) => { // 遍历抽象花瓣 更新移动
			const id = data.id; // 抽象花瓣 id
			if ( !id ) 			// 空花瓣
				return ;
			const info = data.info; 			// 抽象花瓣信息
			const instances = data.instances; 	// 实例列表

			const angle = player.var.angle + idx * (Math.PI * 2 / clusterCnt); // 计算当前抽象花瓣亚轨道中心在轨道的角度
			const cx = player.var.pos.x + (info.orbit_extra + player.var.attr.orbit[player.var.state]) * Math.cos(angle); // 亚轨道中心坐标
			const cy = player.var.pos.y + (info.orbit_extra + player.var.attr.orbit[player.var.state]) * Math.sin(angle);

			if ( info.count == 1 ) { // 单子花瓣
				if ( instances[0] ) {
					const petal = $.entities[instances[0]];
					const dx = cx - petal.var.pos.x, dy = cy - petal.var.pos.y;
					entityHandler.move.bind(petal)( // 更新花瓣 movement
						Math.atan2(dy, dx), // 方向
						Math.sqrt(dx * dx + dy * dy) * $.props.petal_speed, // 大小
					);
				}
				return ;
			}

			info.angle = (info.angle + info.rot_speed) % (Math.PI * 2); // 更新亚轨道起始角度

			for (let subidx = 0; subidx < info.count; subidx ++ ) { // 遍历实例
				if ( instances[subidx] ) { // 实例存在
					const sub_angle = info.angle + subidx * (Math.PI * 2 / info.count); // 计算当前实例在抽象花瓣亚轨道的角度
					const x = cx + info.sub_orbit * Math.cos(sub_angle); // 实例目标坐标
					const y = cy + info.sub_orbit * Math.sin(sub_angle);
					const petal = $.entities[instances[subidx]]; // 当前实例
					const dx = x - petal.var.pos.x, dy = y - petal.var.pos.y;
					entityHandler.move.bind(petal)( // 更新花瓣 movement
						Math.atan2(dy, dx), // 方向
						Math.sqrt(dx * dx + dy * dy) * $.props.petal_speed, // 大小
					);
				}
			}
		});
	});
}

/*
花瓣相关概念定义
抽象花瓣：玩家可以获取的，非实体的花瓣
实体花瓣：有碰撞箱的实体花瓣
loadout：一行抽象花瓣的集合
kit：主副 loadout 的集合
绑定：实体花瓣一般绑定到生成它的抽象花瓣
当该实体花瓣脱离其抽象花瓣且不影响所属抽象花瓣生成新的实体花瓣时解绑
例如：导弹发射，花粉放置

kit: {size, primary:[{id, info, instances:[uuid]}], secondary:[{id, info}]}
记录 loadout size, 主副 loadout 抽象花瓣的 id, info

抽象花瓣 info 格式：
'basic': { 					// key 与抽象花瓣 id 对应
	id: 'basic', 			// 抽象花瓣 id
	instance_id: 'basic', 	// 实体花瓣 id
	cd: 62, 				// = 2.48s 单位 刻 冷却时间
	cd_remain: [], 			// 各实例剩余冷却时间
	count: 1, 				// 数量，等于 1 表示单子，多于 1 表示多子
	pattern: 0, 			// 多子形态，0 表示分散，1 表示聚合
	angle: 0,				// 多子花瓣的亚轨道起始角度
	rot_speed: 0.05,		// 亚轨道旋转速度 单位:弧度 / 刻
	orbit_extra: 100,		// 额外轨道半径
	sub_orbit: 0,			// 亚轨道半径
	speci6al: [], 			// 特殊技能合集
}
具体参考 petalInfo.js

petals: [uuid]
记录已解绑实体花瓣的 uuid
*/

function initPetals(defaultKitInfo) { // Player 调用
	const $ = this.var;
	$.kit = {
		size: defaultKitInfo.size,
		primary: [],
		secondary: [],	
	};
	$.petals = [];
	$.angle = 0; // 轨道起始角度
	defaultKitInfo.primary.forEach(id => {
		const data = {
			id: id,
			info: structuredClone(petalInfo[id]),
			instances: [],
		};
		if ( id ) { // 如果 id 不为空
			data.info.cd_remain = new Array(data.info.count).fill(data.info.cd); // 填充 cd_remain 列表
		}
		$.kit.primary.push(data);
	});
	if ( $.kit.primary.length < $.kit.size ) { // 长度不够，补空的
		$.kit.primary = $.kit.primary.concat(new Array($.kit.size - $.kit.primary.length).fill({id: ''}));
	} else if ( $.kit.primary.lenth > $.kit.size ) { // 长度超过，删除多余的
		$.kit.primary = $.kit.primary.slice(0, $.kit.size);
	}
	defaultKitInfo.secondary.forEach(id => {
		$.kit.secondary.push({
			id: id,
			info: petalInfo[id],
		});
	});
	if ( $.kit.secondary.length < $.kit.size ) { // 长度不够，补空的
		$.kit.secondary = $.kit.secondary.concat(new Array($.kit.size - $.kit.secondary.length).fill({id: ''}));
	} else if ( $.kit.secondary.lenth > $.kit.size ) { // 长度超过，删除多余的
		$.kit.secondary = $.kit.secondary.slice(0, $.kit.size);
	}
}

function handlePlayerDeath(player) { // Game 调用
	const $ = this.var;
	player.setSpec(true);
	const kit = player.var.kit;
	kit.primary.forEach(data => { // 杀死死亡玩家的所有花瓣
		data.instances.forEach(uuid => {
			const petal = $.entities[uuid];
			if ( !petal ) // 花瓣不存在
				return ;
			petal.var.unbound = true;
			handlePetalDeath.bind(this)(petal); // 杀死花瓣
			entityHandler.removeEntity.bind(this)(petal.var.uuid);
		});
	});
}

function handlePetalDeath(petal) { // Game 调用
	const $ = this.var;
	if ( petal.var.unbound ) // 已解绑花瓣
		return ;
	const player = $.entities[petal.var.parent]; // 获取花瓣所属玩家
	if ( !player ) // 玩家已不存在
		return ;
	const data = player.var.kit.primary[petal.var.idx]; // 获取所属抽象花瓣数据
	data.info.cd_remain[petal.var.subidx] = data.info.cd; // 重置 cd
	data.instances[petal.var.subidx] = ''; // 清除旧 uuid 不可省略 因为这用于判定是否在冷却期间
}

export {
	init,
	addPlayer,
	updatePlayers,
	handlePlayerDeath,
	handlePetalDeath,
};