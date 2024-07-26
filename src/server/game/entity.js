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
				rot_speed,		// 花瓣轨道转速 单位:弧度 / 刻 顺时针为正
				orbit: [],		// 不同状态下花瓣轨道半径
				invulnerable,	// 不会死亡判定
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
		};
	}
}

export default Entity;