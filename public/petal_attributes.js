module.exports = Object.freeze({
	BASIC: {
		TYPE: 'BASIC',
		RADIUS: 8,
		RELOAD: 2.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: true,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
		},
	},
	BUBBLE: {
		TYPE: 'BUBBLE',
		RADIUS: 8,
		RELOAD: 3.5,
		DAMAGE: 0,
		MAX_HP: 1,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			BUBBLE_PUSH: 1000,
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
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
		},
	},
	ROCK: {
		TYPE: 'ROCK',
		RADIUS: 8,
		RELOAD: 10,
		DAMAGE: 10,
		MAX_HP: 90,
		MASS: 1,
		EXPANDABLE: true,
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
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			ACTION_COOLDOWN: 1,
			ACTION_TIME: 0.5,
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
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			PROJECTILE: 500,
			ACTION_TIME: 1.5,
			ACTION_COOLDOWN: 0.5,
			NO_HEAL: 10,
		},
	},
	MISSILE: {
		TYPE: 'MISSILE',
		RADIUS: 5,
		RELOAD: 3,
		DAMAGE: 35,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			PROJECTILE: 500,
			ACTION_TIME: 2,
			ACTION_COOLDOWN: 0.5,
		},
	},
	ROSE_ADVANCED: {
		TYPE: "ROSE_ADVANCED",
		RADIUS: 8,
		RELOAD: 3.5,
		DAMAGE: 5,
		MAX_HP: 5,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			ACTION_COOLDOWN: 1,
			ACTION_TIME: 0.5,
			HEAL: 22,
		},
	},
	SALT: {
		TYPE: 'SALT',
		RADIUS: 8,
		RELOAD: 4,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: true,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
		},
	},
	CACTUS_TOXIC: {
		TYPE: 'CACTUS_TOXIC',
		RADIUS: 10,
		RELOAD: 1,
		DAMAGE: 5,
		MAX_HP: 15,
		MASS: 1,
		EXPANDABLE: true,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			BODY_POISON: 40,
			BODY_TOXICITY: 8,
			POISON: 6,
			TOXICITY: 8, 
		},
	},
	IRIS: {
		TYPE: 'IRIS',
		RADIUS: 5,
		RELOAD: 6,
		DAMAGE: 5,
		MAX_HP: 5,
		MASS: 1,
		EXPANDABLE: true,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			POISON: 60,
			TOXICITY: 8,
		},
	},
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
	MULTIPLE: true / false, // 是否为多子
	CLUSTER: true / false, // 是否为一簇（多子）
	COUNT: count, // 多子数量
	TRIGGERS: { // 特殊能力
		PROJECTILE: speed, // 左键触发发射; 发射速度
		NO_HEAL: time, // 击中禁止回血; 效果持续时间
		HEAL: heal, // 非满血时吸收式回血; 回血量
		ACTION_COOLDOWN: time // 加载后冷却时间；时间
		ACTION_TIME: time // 动作时间；时间 (玫瑰吸收时间，导弹持续时间)
		BUBBLE_PUSH: push, // 泡泡触发时推动; 推动力
		POISON: poison // 总毒伤
		TOXICITY: dmg // 每秒毒伤
		BODY_POISON: poison // 身体碰撞毒伤
		BODY_TOXICITY: dmg // 身体碰撞每秒毒伤
	}, 
}
*/