import * as util from './utility.js';

class Entity { // 所有实体的类
	constructor(type, x, y, team, attr = {}) {
		this.var = {
			uuid: util.getNewUUID(), // 获取新的 uuid
			type: type, // 每一种实体独一无二的类型名
			pos: { // 位置
				x: x, // x 坐标
				y: y, // y 坐标
			},
			team: team, // 队伍
			attr: attr, // 属性
			/*
				hp, 	// 血量
				max_hp, // 血量上限
				radius, // 半径
				vision, // 视距
				mass, 	// 重量
				speed, // 移动速度
				ghost, // 无碰撞箱
				ignore_border,	// 无视地图边界
				invulnerable,	// 不会死亡判定
				poison_res,		// 中毒抗性; 1 为免疫中毒伤害
				poison: {duration, dmg}, // 碰撞对目标造成中毒
				dmg_reflect,	// 反伤百分比
				dir,	// 方向
			*/
			v: { // 速度
				x: 0,
				y: 0,
			},
			a: { // 加速度
				x: 0,
				y: 0,
			},
			movement: { // 移动方向
				dir: 0,
				val: 0,
			},
			v_list: [], // 其他速度列表 [{resistance, x, y}]
			chunks: [], // 所覆盖区块
			effects: { // 状态效果
				poison: { // 中毒
					duration: 0,	// 时长 单位: 刻
					value: 0,			// 每刻伤害
				},
				heal_res: {
					duration: 0,
					value: 0,		// 抗性百分点 100 为完全免疫回血
				},
			},
		};
	}

	effect(id, duration, value) {
		const $ = this.var;
		const cur = $.effects[id];
		if ( id == 'poison' ) {
			if ( cur.duration * cur.value <= duration * value ) { // 使用总毒伤较高的一方
				cur.duration = duration;
				cur.value = value;
			}
		} else {
			if ( cur.duration < duration ) {
				cur.duration = duration;
				cur.value = value;
			}
		}
	}

	heal(value) {
		const $ = this.var;
		const heal_res = ($.effects.heal_res.duration > 0) ? ($.effects.heal_res.value * 0.01) : 0;
		$.attr.hp = Math.min($.attr.max_hp, $.attr.hp + value * ( 1 - heal_res ) );
	}
}

export default Entity;