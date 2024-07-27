import * as entityHandler from './entityHandler.js';
import * as playerHandler from './playerHandler.js';

// 花瓣技能

export default Object.freeze({
	'leaf': {
		'onFirstLoad': [
			// 首次 load 时增加 0.04 点每刻自然回血
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				player.var.heal.point += 0.04;
			},
		],
		'onUnequip': [
			// unequip 时减少 0.04 点每刻自然回血
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				player.var.heal.point -= 0.04;
			},
		],
	},
	'iris': {
		'onHit': [
			// 击中目标时给予中毒效果 duration 150 dmg 0.4
			function (instance, target) {
				target.poison(150, 0.4);
			}
		],
	},
	'rose': {
		'onLoad': [
			function (instance) {
				const skill = instance.var.skill;
				skill.ready = 0; // 初始化 ready 计时器
				skill.pend = 0; // 初始化 pend 计时器
			}
		],
		'onTick': [
			function (instance) {
				const skill = instance.var.skill;
				if ( skill.ready < 25 ) { // 需要 25 刻准备
					skill.ready += 1;
					return ;
				}
				// 准备完成
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				if ( player.var.attr.hp < player.var.attr.max_hp ) { // 玩家需要回血
					if ( skill.pend < 25 ) { // 需要 25 刻判定
						if ( skill.pend == 0 ) { // 判定的第一刻
							info.orbit_special = player.var.attr.radius + instance.var.attr.radius * 0.8; // 设置特殊轨道
						}
						skill.pend += 1; // 更新计时器
						return ;
					}
				} else {
					skill.pend = 0; // 重置 pend 计时器
					info.orbit_special = -1; // 取消特殊轨道
					return ;
				}
				// 判定完成
				const heal = 10; // 回血量
				player.var.attr.hp = Math.min(player.var.attr.hp + heal, player.var.attr.max_hp); // 回血
				playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
				entityHandler.removeEntity.bind(this)(instance.var.uuid);
				info.orbit_special = -1; // 取消特殊轨道
			}
		],
	},
	'epic_rose': {
		'onLoad': [
			function (instance) {
				const skill = instance.var.skill;
				skill.ready = 0; // 初始化 ready 计时器
				skill.pend = 0; // 初始化 pend 计时器
			}
		],
		'onTick': [
			function (instance) {
				const skill = instance.var.skill;
				if ( skill.ready < 25 ) { // 需要 25 刻准备
					skill.ready += 1;
					return ;
				}
				// 准备完成
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				if ( player.var.attr.hp < player.var.attr.max_hp ) { // 玩家需要回血
					if ( skill.pend < 25 ) { // 需要 25 刻判定
						if ( skill.pend == 0 ) { // 判定的第一刻
							info.orbit_special = player.var.attr.radius + instance.var.attr.radius * 0.8; // 设置特殊轨道
						}
						skill.pend += 1; // 更新计时器
						return ;
					}
				} else {
					skill.pend = 0; // 重置 pend 计时器
					info.orbit_special = -1; // 取消特殊轨道
					return ;
				}
				// 判定完成
				const heal = 22; // 回血量
				player.var.attr.hp = Math.min(player.var.attr.hp + heal, player.var.attr.max_hp); // 回血
				playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
				entityHandler.removeEntity.bind(this)(instance.var.uuid);
				info.orbit_special = -1; // 取消特殊轨道
			}
		],
	},
	'dahlia': {
		'onLoad': [
			function (instance) {
				const skill = instance.var.skill;
				skill.ready = 0; // 初始化 ready 计时器
				skill.pend = 0; // 初始化 pend 计时器
			}
		],
		'onTick': [
			function (instance) {
				const skill = instance.var.skill;
				if ( skill.ready < 25 ) { // 需要 25 刻准备
					skill.ready += 1;
					return ;
				}
				// 准备完成
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				if ( player.var.attr.hp < player.var.attr.max_hp ) { // 玩家需要回血
					if ( skill.pend < 25 ) { // 需要 25 刻判定
						if ( skill.pend == 0 ) { // 判定的第一刻
							info.orbit_special = player.var.attr.radius + instance.var.attr.radius * 0.8; // 设置特殊轨道
						}
						skill.pend += 1; // 更新计时器
						return ;
					}
				} else {
					skill.pend = 0; // 重置 pend 计时器
					info.orbit_special = -1; // 取消特殊轨道
					return ;
				}
				// 判定完成
				const heal = 4; // 回血量
				player.var.attr.hp = Math.min(player.var.attr.hp + heal, player.var.attr.max_hp); // 回血
				playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
				entityHandler.removeEntity.bind(this)(instance.var.uuid);
				info.orbit_special = -1; // 取消特殊轨道
			}
		],
	},
	'wing': {
		'onLoad': [
			function (instance) {
				const skill = instance.var.skill;
				skill.on = false; // 是否开始漂浮
			}
		],
		'onTick': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				const skill = instance.var.skill;
				if ( player.var.state & 1 ) {
					if ( !skill.on ) {
						skill.on = true;
						info.pattern = 1; // 启动漂浮
					}
				} else {
					if ( skill.on ) {
						skill.on = false;
						info.pattern = 0; // 关闭漂浮
					}
				}
			}
		]
	},
	'cactus': {
		'onFirstLoad': [
			// 首次 load 时增加 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				// 等比增加血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp += 20;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
		'onUnequip': [
			// unequip 时减少 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				// 等比减少血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp -= 20;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
	},
	'faster': {
		'onFirstLoad': [
			// 首次 load 时增加 0.032 rad/tick 转速
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				player.var.attr.rot_speed += 0.032;
			},
		],
		'onUnequip': [
			// unequip 时减少 0.032 rad/tick 转速
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				player.var.attr.rot_speed -= 0.032;
			},
		],
	},
	'triple_cactus': {
		'onFirstLoad': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp += 15;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
		'onUnequip': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp -= 15;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
	},
	'salt': {
		'onFirstLoad': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				player.var.stack['salt'] ??= 0; // 若首次使用 初始化堆叠计数
				if ( player.var.stack['salt'] == 0 ) { // 未堆叠
					player.var.attr.dmg_reflect += 25; // 更新反伤百分比
				}
				player.var.stack['salt'] ++; // 更新堆叠计数
			},
		],
		'onUnequip': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				if ( player.var.stack['salt'] == 1 ) { // 未堆叠
					player.var.attr.dmg_reflect -= 25; // 更新反伤百分比
				}
				player.var.stack['salt'] --; // 更新堆叠计数
			},
		],
	},
	'cactus_toxic': {
		'onFirstLoad': [
			// 首次 load 时增加 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];

				// 等比增加血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp += 20;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;

				player.var.stack['cactus_toxic'] ??= 0; // 若首次使用 初始化堆叠计数
				if ( player.var.stack['cactus_toxic'] == 0 ) { // 未堆叠
					player.var.attr.poison.duration = 100; // 设置玩家毒伤 duration 100 dmg 0.4(10) total 40
					player.var.attr.poison.dmg = 0.4;
				}
				player.var.stack['cactus_toxic'] ++; // 更新堆叠计数
			},
		],
		'onHit': [
			// 击中目标时给予中毒效果 duration 15 dmg 0.4(10) total 6
			function (instance, target) {
				target.poison(15, 0.4);
			}
		],
		'onUnequip': [
			// unequip 时减少 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				// 等比减少血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp -= 20;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
				
				if ( player.var.stack['cactus_toxic'] == 1 ) { // 未堆叠
					player.var.attr.poison.duration = 0; // 设置玩家毒伤
					player.var.attr.poison.dmg = 0;
				}
				player.var.stack['cactus_toxic'] --; // 更新堆叠计数
			},
		],
	},
});

/*
花瓣技能属于抽象花瓣，根据抽象花瓣的 id 来判定技能组

触发器列表
onFirstLoad		// 首次加载
onLoad			// 加载
onHit			// 击中目标
onTick			// 每刻执行
*/