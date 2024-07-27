import * as util from './utility.js';
import Player from './player.js';
import * as entityHandler from './entityHandler.js';
import mobAttr from './mobAttr.js';
import petalAttr from './petalAttr.js';
import petalInfo from './petalInfo.js';
import petalSkill from './petalSkill.js';
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
	const attr = structuredClone(mobAttr.player);
	const defaultAttr = structuredClone(mobAttr.default);

	// 将未设置属性设置为默认值
	attr.max_hp ??= defaultAttr.max_hp;
	attr.hp ??= attr.max_hp;
	attr.radius ??= defaultAttr.radius;
	attr.vision ??= defaultAttr.vision;
	attr.mass ??= defaultAttr.mass;
	attr.speed ??= defaultAttr.speed;
	attr.ghost ??= defaultAttr.ghost;
	attr.ignore_border ??= defaultAttr.ignore_border;
	attr.rot_speed ??= defaultAttr.rot_speed;
	attr.orbit ??= defaultAttr.orbit;
	attr.invulnerable ??= defaultAttr.invulnerable;
	attr.poison_res ??= defaultAttr.poison_res;

	const newPlayer = new Player( // 创建新 Player 实例
		socket.id,
		username,
		x, y,
		team,
		attr,
	);
	const uuid = newPlayer.var.uuid;	// 获取 uuid
	$.players[socket.id] = uuid;		// 储存 uuid
	entityHandler.addEntity.bind(this)(uuid, newPlayer);	// 添加实体到实体列表
	initPetals.bind(newPlayer)($.props.default_kit_info);	// 初始化花瓣相关信息
}

function playerNaturalRegen(player) { // 玩家自然会血
	const $ = this.var;
	if ( $.tick % $.props.player_natural_regen.interval)
		return ;
	player.var.attr.hp = Math.min(player.var.attr.max_hp, player.var.attr.hp + $.props.player_natural_regen.point + $.props.player_natural_regen.percent * player.var.attr.max_hp * 0.01);
}

function updatePlayers() { // Game 调用 更新玩家
	const $ = this.var;
	Object.values($.players).map(uuid => $.entities[uuid]).forEach(player => { // 遍历玩家
		if ( player.var.spec ) { // 玩家是观察者
			return ;
		}

		playerNaturalRegen.bind(this)(player);

		player.regen();

		const kit = player.var.kit;
		let clusterCnt = 0; // 花瓣簇总数 聚合算 1 分散算 n
		player.var.angle = (player.var.angle + player.var.attr.rot_speed) % (Math.PI * 2); // 更新轨道起始角度

		kit.primary.forEach((data) => {
			const id = data.id; // 抽象花瓣 id
			if ( !id ) // 空花瓣
				return ;
			const info = data.info;
			const instances = data.instances;
			for (let subidx = 0; subidx < info.count; subidx ++ ) { // 遍历实例
				if ( !instances[subidx] ) // 实例不存在
					continue;
				const instance = $.entities[instances[subidx]]; // 实例
				// 判定花瓣技能触发器
				(() => {
					const skill = petalSkill[id];
					if ( !skill ) // 花瓣无技能
						return ;
					if ( skill['onTick'] ) { // onTick 触发器
						skill['onTick'].forEach(fn => {
							fn.bind(this)(instance);
						});
					}
				})();
			}
		});

		// 遍历抽象花瓣 更新冷却 花瓣簇计数
		kit.primary.forEach((data, idx) => {
			const id = data.id; // 抽象花瓣 id
			if ( !id ) // 空花瓣
				return ;
			const info = data.info; 			// 抽象花瓣信息
			const instances = data.instances; 	// 实例列表

			clusterCnt += ((info.pattern == 0) ? info.count : 1); // 花瓣簇计数

			for (let subidx = 0; subidx < info.count; subidx ++ ) { // 遍历实例 更新 冷却时间
				if ( !instances[subidx] ) { 	// 如果实例不存在 即 在冷却时间
					info.cd_remain[subidx] --; 	// 更新冷却时间
					if ( info.cd_remain[subidx] <= 0 ) { 	// 冷却时间结束 load 新实例
						const attr = structuredClone(petalAttr[info.instance_id]); // 默认属性
						const defaultAttr = structuredClone(petalAttr['default']); // 未设置值默认值

						// 自动设置未设置值为默认值
						attr.max_hp ??= defaultAttr.max_hp;
						attr.hp ??= attr.max_hp;
						attr.mass ??= defaultAttr.mass;
						attr.radius ??= defaultAttr.radius;
						attr.ignore_border ??= defaultAttr.ignore_border;
						attr.dmg ??= defaultAttr.dmg;

						// 创建新 Petal
						const newPetal = new Petal(
							info.instance_id, 						// 获取实例 id
							player.var.uuid, 						// 设置玩家为 parent
							idx, 									// 所属抽象花瓣的编号
							subidx,									// 在所属抽象花瓣的实例集合中的编号
							player.var.pos.x, player.var.pos.y, 	// 继承玩家的位置
							player.var.team,						// 继承玩家的所在队伍
							attr,									// 默认属性
						);
						const uuid = newPetal.var.uuid; // 获取新花瓣 uuid
						instances[subidx] = uuid; 		// 储存 uuid
						entityHandler.addEntity.bind(this)(uuid, newPetal); // 添加实体到实体列表

						// 判定花瓣技能触发器
						if ( info.cuml_cnt == 0 ) {
							(() => {
								const skill = petalSkill[id];
								if ( !skill ) // 花瓣无技能
									return ;
								if ( skill['onFirstLoad'] ) { // onFirstLoad 触发器
									skill['onFirstLoad'].forEach(fn => {
										fn.bind(this)(newPetal);
									});
								}
							})();
						}
						(() => {
							const skill = petalSkill[id];
							if ( !skill ) // 花瓣无技能
								return ;
							if ( skill['onLoad'] ) { // onLoad 触发器
								skill['onLoad'].forEach(fn => {
									fn.bind(this)(newPetal);
								});
							}
						})();
						info.cuml_cnt += info.count;	// 更新累计 load 实例数量
					}
				}
			}
		});

		let clusteridx = 0; // 当前花瓣簇编号
		kit.primary.forEach((data) => { // 遍历抽象花瓣 更新移动
			const id = data.id; // 抽象花瓣 id
			if ( !id ) 			// 空花瓣
				return ;
			const info = data.info; 			// 抽象花瓣信息
			const instances = data.instances; 	// 实例列表

			if ( info.pattern == 0 ) { // 分散
				for (let subidx = 0; subidx < info.count; subidx ++) { // 遍历该抽象花瓣的实例
					if ( instances[subidx] ) { // 实例存在
						const petal = $.entities[instances[subidx]]; // 当前实例（花瓣实体）
						const angle = player.var.angle + Math.PI * 2 * (clusteridx / clusterCnt); // 计算当前实例在轨道的角度

						const state = player.var.state;
						const orbit_radius = (info.orbit_special == -1) ? (info.orbit_extra[state] + info.orbit_disabled[state] ? player.var.attr.orbit[0] : player.var.attr.orbit[state]) : info.orbit_special;
						
						const x = player.var.pos.x + orbit_radius * Math.cos(angle); // 目标坐标
						const y = player.var.pos.y + orbit_radius * Math.sin(angle);
	
						const dx = x - petal.var.pos.x, dy = y - petal.var.pos.y; // 计算 目标坐标 相对于 目前坐标 的 相对坐标
							
						entityHandler.move.bind(petal)( // 更新花瓣 movement
							Math.atan2(dy, dx), // 方向
							Math.sqrt(dx * dx + dy * dy) * $.props.petal_speed, // 大小
						);
					}
					clusteridx += 1; // 更新花瓣簇编号
				}
			} else { // 聚合
				const angle = player.var.angle + Math.PI * 2 * (clusteridx / clusterCnt); // 计算当前抽象花瓣亚轨道中心在轨道的角度

				const state = player.var.state;
				const orbit_radius = (info.orbit_special == -1) ? (info.orbit_extra[state] + info.orbit_disabled[state] ? player.var.attr.orbit[0] : player.var.attr.orbit[state]) : info.orbit_special;
				
				const cx = player.var.pos.x + orbit_radius * Math.cos(angle); // 亚轨道中心坐标
				const cy = player.var.pos.y + orbit_radius * Math.sin(angle);

				for (let subidx = 0; subidx < info.count; subidx ++) { // 遍历该抽象花瓣的实例
					if ( instances[subidx] ) { // 实例存在
						const petal = $.entities[instances[subidx]]; // 当前实例（花瓣实体）

						const sub_angle = info.angle + subidx * (Math.PI * 2 / info.count); // 计算当前实例在抽象花瓣亚轨道的角度
						const subdx = (info.orbit_special == -1) ? info.sub_orbit * Math.cos(sub_angle) : 0; // 在亚轨道上相对与亚轨道中心的相对坐标
						const subdy = (info.orbit_special == -1) ? info.sub_orbit * Math.sin(sub_angle) : 0; // 特殊轨道启用时取消亚轨道; 所有实例强制重叠在亚轨道中心
	
						const dx = cx + subdx - petal.var.pos.x, dy = cy + subdy - petal.var.pos.y; // 计算 目标坐标 相对于 目前坐标 的 相对坐标
							
						entityHandler.move.bind(petal)( // 更新花瓣 movement
							Math.atan2(dy, dx), // 方向
							Math.sqrt(dx * dx + dy * dy) * $.props.petal_speed, // 大小
						);
					}
				}
				info.angle = (info.angle + info.rot_speed) % (Math.PI * 2); // 更新亚轨道起始角度
				clusteridx += 1; // 更新花瓣簇编号
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
	$.petals = []; // 已解绑花瓣 uuid
	$.angle = 0; // 轨道起始角度
	defaultKitInfo.primary.forEach(id => {
		if ( !id ) { // 空花瓣
			$.kit.primary.push({id: ''});
			return ;
		}
		const info = structuredClone(petalInfo[id]); // 获取抽象花瓣信息
		const defaultInfo = structuredClone(petalInfo['default']); // 默认信息

		// 自动设置未设定值为默认设定
		info.instance_id ??= id;
		info.cd ??= defaultInfo.cd;
		info.count ??= defaultInfo.count;
		info.pattern ??= defaultInfo.pattern;
		info.angle ??= defaultInfo.angle;
		info.rot_speed ??= defaultInfo.rot_speed;
		info.orbit_extra ??= defaultInfo.orbit_extra;
		info.orbit_disabled ??= defaultInfo.orbit_disabled;
		info.orbit_special ??= defaultInfo.orbit_special;
		info.sub_orbit ??= defaultInfo.sub_orbit;
		info.cuml_cnt ??= defaultInfo.cuml_cnt;

		info.cd_remain = new Array(info.count).fill(info.cd); // 设置初始 cd

		const data = {
			id: id,
			info: info,
			instances: [],
		};

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
	kit.primary.forEach(data => { // 移除死亡玩家的所有花瓣
		if ( !data.id ) // 空花瓣
			return ;
		data.instances.forEach(uuid => {
			const petal = $.entities[uuid];
			if ( !petal ) // 花瓣不存在
				return ;
			petal.var.unbound = true;
			handlePetalDeath.bind(this)(petal); // 移除花瓣
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