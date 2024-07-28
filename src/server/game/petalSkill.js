import * as entityHandler from './entityHandler.js';
import * as playerHandler from './playerHandler.js';

// 花瓣技能

export default Object.freeze({
	'consistent_heal': {
		/*
			consistent_heal,	// 每刻回血量
		*/
		'onFirstLoad': [
			// 首次 load 时增加 heal 点每刻自然回血
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.heal.point += sv.consistent_heal;
			},
		],
		'onUnequip': [
			// unequip 时减少 heal 点每刻自然回血
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.heal.point -= sv.consistent_heal;
			},
		],
	},
	'poison_on_hit': {
		/*
			duration,	// 中毒时长
			dmg,		// 中毒每刻伤害
		*/
		'onHit': [
			// 击中目标时给予中毒效果 duration 150 dmg 0.4
			function (instance, target) {
				const sv = instance.var.skill_var;
				target.poison(sv.poison_on_hit_duration, sv.poison_on_hit_dmg);
			}
		],
	},
	'heal': {
		/*
			heal,		// 回血量 单位: 点
			heal_ready_time,	// 准备时间 从 load 到可以开始判定
			heal_pend_time,	// 判定时间 从开始判定到回血
		*/
		'onLoad': [
			function (instance) {
				const sv = instance.var.skill_var;
				sv.heal_ready = 0; // 初始化 ready 计时器
				sv.heal_pend = 0; // 初始化 pend 计时器
			}
		],
		'onTick': [
			function (instance) {
				const sv = instance.var.skill_var;
				if ( sv.heal_ready < sv.heal_ready_time ) { // 准备时间
					sv.heal_ready += 1;
					return ;
				}
				// 准备完成
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				if ( player.var.attr.hp < player.var.attr.max_hp ) { // 玩家需要回血
					if ( sv.heal_pend < sv.heal_pend_time ) { // 判定时间
						if ( sv.heal_pend == 0 ) { // 判定的第一刻
							info.orbit_special = player.var.attr.radius + instance.var.attr.radius * 0.8; // 设置特殊轨道
						}
						sv.heal_pend += 1; // 更新计时器
						return ;
					}
				} else {
					sv.heal_pend = 0; // 重置 pend 计时器
					info.orbit_special = -1; // 取消特殊轨道
					return ;
				}
				// 判定完成
				const heal = sv.heal; // 回血量
				player.var.attr.hp = Math.min(player.var.attr.hp + heal, player.var.attr.max_hp); // 回血
				playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
				entityHandler.removeEntity.bind(this)(instance.var.uuid);
				info.orbit_special = -1; // 取消特殊轨道
			}
		],
	},
	'float': {
		'onLoad': [
			function (instance) {
				const sv = instance.var.skill_var;
				sv.on = false; // 是否开始漂浮
			}
		],
		'onTick': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const info = player.var.kit.primary[instance.var.idx].info;
				const sv = instance.var.skill_var;
				if ( player.var.state & 1 ) {
					if ( !sv.on ) {
						sv.on = true;
						info.pattern = 1; // 启动漂浮
					}
				} else {
					if ( sv.on ) {
						sv.on = false;
						info.pattern = 0; // 关闭漂浮
					}
				}
			}
		]
	},
	'extra_hp': {
		/*
			extra_hp, // 额外血量
		*/
		'onFirstLoad': [
			// 首次 load 时增加 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				// 等比增加血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp += sv.extra_hp;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
		'onUnequip': [
			// unequip 时减少 20 点最大血量
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				// 等比减少血量
				const hpPercent = player.var.attr.hp / player.var.attr.max_hp;
				player.var.attr.max_hp -= sv.extra_hp;
				player.var.attr.hp = hpPercent * player.var.attr.max_hp;
			},
		],
	},
	'extra_rot_speed': {
		/*
			extra_rot_speed,	// 额外转速
		*/
		'onFirstLoad': [
			// 首次 load 时增加 extra_rot_speed rad/tick 转速
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.attr.rot_speed += sv.extra_rot_speed;
			},
		],
		'onUnequip': [
			// unequip 时减少 extra_rot_speed rad/tick 转速
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.attr.rot_speed -= sv.extra_rot_speed;
			},
		],
	},
	'dmg_reflect_unstackable': {
		/*
			stack_id,		// 用于堆叠计数
			dmg_reflect,	// 反伤百分点
		*/
		'onFirstLoad': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.stack[sv.stack_id] ??= 0; // 若首次使用 初始化堆叠计数
				if ( player.var.stack[sv.stack_id] == 0 ) { // 未堆叠
					player.var.attr.dmg_reflect += sv.dmg_reflect; // 更新反伤百分比
				}
				player.var.stack[sv.stack_id] ++; // 更新堆叠计数
			},
		],
		'onUnequip': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				if ( player.var.stack[sv.stack_id] == 1 ) { // 未堆叠
					player.var.attr.dmg_reflect -= sv.dmg_reflect; // 更新反伤百分比
				}
				player.var.stack[sv.stack_id] --; // 更新堆叠计数
			},
		],
	},
	'poison_unstackable': {
		/*
			stack_id,			// 堆叠 id 用于堆叠计数
			poison_duration,	// 中毒持续时间
			poison_dmg,			// 中毒每刻伤害
		*/
		'onFirstLoad': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				player.var.stack[sv.stack_id] ??= 0; // 若首次使用 初始化堆叠计数
				if ( player.var.stack[sv.stack_id] == 0 ) { // 未堆叠
					player.var.attr.poison.duration = sv.poison_duration; // 设置玩家毒伤
					player.var.attr.poison.dmg = sv.poison_dmg;
				}
				player.var.stack[sv.stack_id] ++; // 更新堆叠计数
			},
		],
		'onUnequip': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				if ( player.var.stack[sv.stack_id] == 1 ) { // 未堆叠
					player.var.attr.poison.duration = 0; // 设置玩家毒伤
					player.var.attr.poison.dmg = 0;
				}
				player.var.stack[sv.stack_id] --; // 更新堆叠计数
			},
		],
	},
	'push': {
		/*
			push_power,		// 推进力
			push_coeff,	// 推进持续系数 [0, 1]
		*/
		'onTick': [
			function (instance) {
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				const sv = instance.var.skill_var;
				if ( player.var.state & 2 ) { // 玩家防御
					entityHandler.appendVelocity.bind(player)( // 推进
						(player.var.pos.x - instance.var.pos.x) * sv.push_power, 
						(player.var.pos.y - instance.var.pos.y) * sv.push_power,
						sv.push_coeff, // 泡泡速度衰减系数
					);
					playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
					entityHandler.removeEntity.bind(this)(instance.var.uuid);
				}
			}
		]
	},
	'project': {
		/*
			弹射物发射
			project_speed,		// 弹射速度
			project_coeff,		// 弹射后速度衰减系数
			project_duration,	// 弹射后持续时间
			project_ready_time,		// 准备时间
			project_pend_time,		// 判定时间
		*/
		'onLoad': [
			function (instance) {
				const sv = instance.var.skill_var;
				sv.project_ready = 0; // 初始化 ready 计时器
				sv.project_pend = 0; // 初始化 pend 计时器
				sv.project_timer = 0; // 初始化弹射后计时器
				sv.projected = false; // 是否已发射
			}
		],
		'onTick': [
			function (instance) { // 发射前
				const sv = instance.var.skill_var;
				if ( sv.project_ready < sv.project_ready_time ) { // 准备时间
					sv.project_ready += 1;
					return ;
				}
				// 准备完成
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				if ( player.var.state & 1 || sv.project_pend >= sv.project_pend_time ) { // 玩家攻击
					if ( sv.project_pend < sv.project_pend_time ) { // 判定时间
						sv.project_pend += 1; // 更新计时器
						return ;
					}
				} else {
					sv.project_pend = 0; // 重置 pend 计时器
					return ;
				}
				// 判定完成
				sv.projected = true;
			},
			function (instance) { // 发射后
				const sv = instance.var.skill_var;
				if ( !sv.projected ) // 未发射
					return ;
				const $ = this.var;
				const player = $.entities[instance.var.parent];
				if ( sv.project_timer >= sv.project_duration ) { // 超过存活时间
					playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
					entityHandler.removeEntity.bind(this)(instance.var.uuid);
					return ;
				}
				if ( !instance.var.unbound ) { // 第一刻
					playerHandler.handlePetalDeath.bind(this)(instance); // 移除对花瓣的记录
					instance.var.unbound_idx = player.var.petals.push(instance.var.uuid) - 1; // 记录在已解绑花瓣中 记录 unbound_idx
					instance.var.unbound = true;
					const dir = Math.atan2(instance.var.pos.y - player.var.pos.y, instance.var.pos.x - player.var.pos.x); // 计算发射方向
					entityHandler.appendVelocity.bind(instance)(
						sv.project_speed * Math.cos(dir),
						sv.project_speed * Math.sin(dir),
						sv.project_coeff,
					);
				}
				sv.project_timer += 1;
			}
		],
	}
});

/*
花瓣技能属于抽象花瓣，根据抽象花瓣的 id 来判定技能组

触发器列表
onFirstLoad		// 首次加载
onLoad			// 加载
onHit			// 击中目标
onTick			// 每刻执行
*/