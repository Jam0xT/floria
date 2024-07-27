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
				if ( skill.pend < 25 ) { // 需要 25 刻判定
					if ( player.var.attr.hp < player.var.attr.max_hp ) { // 玩家需要回血
						if ( skill.pend == 0 ) { // 判定的第一刻
							info.orbit_special = player.var.attr.radius + instance.var.attr.radius * 0.8; // 设置特殊轨道
						}
						skill.pend += 1; // 更新计时器
						return ;
					} else {
						skill.pend = 0; // 重置 pend 计时器
						info.orbit_special = -1; // 取消特殊轨道
						return ;
					}
				}
				// 判定完成
				const heal = 10; // 回血量
				player.var.attr.hp = Math.min(player.var.attr.hp + heal, player.var.attr.max_hp); // 回血
				playerHandler.handlePetalDeath.bind(this)(instance); // 移除花瓣
				entityHandler.removeEntity.bind(this)(instance.var.uuid);
				info.orbit_special = -1; // 取消特殊轨道
			}
		],
	}
});

/*
花瓣技能属于抽象花瓣，根据抽象花瓣的 id 来判定技能组

触发器列表
onFirstLoad		// 首次加载
onHit			// 击中目标
onTick			// 每刻执行
*/