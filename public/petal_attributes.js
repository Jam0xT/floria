module.exports = Object.freeze({
	BASIC: {
		TYPE: 'BASIC',
		RADIUS: 8,
		RELOAD: 2.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: true,
		EXTRA_KNOCKBACK: 0,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {},
	},
	BUBBLE: {
		TYPE: 'BUBBLE',
		RADIUS: 8,
		RELOAD: 3.5,
		DAMAGE: 0,
		MAX_HP: 1,
		MASS: 1,
		EXPANDABLE: false,
		EXTRA_KNOCKBACK: 0,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			BUBBLE_PUSH: 1500,
		},
	},
	STINGER: {
		TYPE: 'STINGER',
		RADIUS: 5,
		RELOAD: 4,
		DAMAGE: 35,
		MAX_HP: 8,
		MASS: 1,
		EXPANDABLE: true,
		EXTRA_KNOCKBACK: 0,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
		},
	},
	ROSE: {
		TYPE: 'ROSE',
		RADIUS: 8,
		RELOAD: 3.5,
		DAMAGE: 5,
		MAX_HP: 5,
		MASS: 1,
		EXPANDABLE: false,
		EXTRA_KNOCKBACK: 0,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			HEAL: 10,
		},
	},
	DANDELION: {
		TYPE: 'DANDELION',
		RADIUS: 8,
		RELOAD: 2,
		DAMAGE: 5,
		MAX_HP: 5,
		MASS: 1,
		EXPANDABLE: false,
		EXTRA_KNOCKBACK: 0,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			SHOOT: 100,
			NO_HEAL: 10,
		},
	}

});
// all petal attributes are here
/*
PETAL_NAME: {
	TYPE: type, //花瓣名称
	RADIUS: radius, // 碰撞箱半径
	RELOAD: reload, // 单位为秒，刷新时间
	DAMAGE: dmg, // 物理伤害
	MAX_HP: max_hp, // 自生血量
	MASS: mass, // 击退抗性
	EXPANDABLE: true / false, // 是否可展开
	EXTRA_KNOCKBACK: knockback, // 击退
	MULTIPLE: true / false, // 是否为多子
	CLUSTER: true / false, // 是否为一簇（多子）
	COUNT: count, // 多子数量
	TRIGGERS: { // 特殊能力
		SHOOT: speed, // 左键触发发射; 发射速度
		NO_HEAL: time, // 击中禁止回血; 效果持续时间
		HEAL: heal, // 非满血时回血; 回血量
		BUBBLE_PUSH: push, // 泡泡触发时推动; 推动力
	}, 
}
*/