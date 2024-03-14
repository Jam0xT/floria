module.exports = Object.freeze({
	EMPTY: {
		TYPE: 'EMPTY',
		RADIUS: 1,
		RENDER_RADIUS: 1,
		RARITY: 1,
		RELOAD: 1,
		DAMAGE: 1,
		MAX_HP: 1,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
	},
	BASIC: {
		TYPE: 'BASIC', // 类型
		RADIUS: 14, // 半径
		RENDER_RADIUS: 1, // 渲染半径
		RARITY: 0, // 稀有度
		RELOAD: 2.5, // 加载时间
		DAMAGE: 10, // 伤害
		MAX_HP: 10, // 最大血量
		MASS: 1, // 质量
		EXPANDABLE: true, // 是否可展开
		MULTIPLE: false, // 是否为多子
		CLUSTER: false, // 是否为团簇
		COUNT: 1,
		EXTRA: [ // 额外功能
			{ // 功能 1
				req: { // 要求
					status_req: { // 状态要求 不写/false为无要求
						required: { // 必须全部满足项
							loaded: false, // 使用中
							exist: false, // 存活中
							left_click: false, // 0 否 1 是
							right_click: false,
							"age>": false, // 存活时间大于
							"age<": false, // 存活时间小于
						},
						optional: [ // 选择性满足项 每一组至少满足其一
							{ // 选项组 1

							},
							{ // 选项组 2
								
							},
						]
					},
					event_req: { // 事件要求 满足任意一项
						load: false, // 使用
						spawn: false, // 花瓣出生 0 任意 1 首次
						hit: false, // 击中目标
						death: false, // 死亡
						unload: false, // 取消使用
					}
				},
				action: [ // 行为
					{
						delay: 0,
						
					}
				]
			},
			{ // 功能 2
				// ...
			}
		]
	},
	BUBBLE: {
	  TYPE: 'BUBBLE',
	  RADIUS: 14,
	  RENDER_RADIUS: 14,
	  RARITY: 6,
	  RELOAD: 0.1,
	  DAMAGE: 0,
	  MAX_HP: 1,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { BUBBLE_PUSH: 1500, ACTION_COOLDOWN: 0.3 }
	},
	CACTUS: {
	  TYPE: 'CACTUS',
	  RADIUS: 20,
	  RENDER_RADIUS: 20,
	  RARITY: 3,
	  RELOAD: 1,
	  DAMAGE: 5,
	  MAX_HP: 15,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	CACTUS_TOXIC: {
	  TYPE: 'CACTUS_TOXIC',
	  RADIUS: 20,
	  RENDER_RADIUS: 20,
	  RARITY: 3,
	  RELOAD: 1,
	  DAMAGE: 5,
	  MAX_HP: 15,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { BODY_POISON: 40, BODY_TOXICITY: 5, POISON: 6, TOXICITY: 5 }
	},
	CARAMBOLA: {
	  TYPE: 'CARAMBOLA',
	  RADIUS: 19,
	  RENDER_RADIUS: 19,
	  RARITY: 2,
	  RELOAD: 3,
	  DAMAGE: 15,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {
	    PROJECTILE: 500,
	    ACTION_TIME: 1.5,
	    ACTION_COOLDOWN: 0.5,
	    POISON: 25,
	    TOXICITY: 5
	  }
	},
	DAHLIA: {
	  TYPE: 'DAHLIA',
	  RADIUS: 8,
	  RENDER_RADIUS: 8,
	  RARITY: 2,
	  RELOAD: 3.5,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: true,
	  CLUSTER: true,
	  COUNT: 3,
	  TRIGGERS: { ACTION_COOLDOWN: 1, ACTION_TIME: 0.5, HEAL: 3.5 }
	},
	EGG: {
	  TYPE: 'EGG',
	  RADIUS: 14,
	  RENDER_RADIUS: 14,
	  RARITY: 4,
	  RELOAD: 1.5,
	  DAMAGE: 2,
	  MAX_HP: 25,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { ACTION_COOLDOWN: 3.5, SUMMON: 'ANT_HOLE' } //HORNET
	},
	FANGS: {
	  TYPE: 'FANGS',
	  RADIUS: 8,
	  RENDER_RADIUS: 8,
	  RARITY: 2,
	  RELOAD: 2,
	  DAMAGE: 15,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {
		  VAMPIRISM: {
		  	HEAL: 0.1,
			HEAL_PLAYER: 0.3,
			COLLIDE: true,
		  },
	  }
	},
	FAST: {
	  TYPE: 'FAST',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 0,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	HEAVY: {
		TYPE: 'HEAVY',
		RADIUS: 10,
		RENDER_RADIUS: 10,
		RARITY: 2,
		RELOAD: 5,
		DAMAGE: 5,
		MAX_HP: 1000,
		MASS: 100,
		EXPANDABLE: true,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {}
	},
	HONEY: {
	  TYPE: 'HONEY',
	  RADIUS: 8,
	  RENDER_RADIUS: 8,
	  RARITY: 2,
	  RELOAD: 1.7,
	  DAMAGE: 10,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	LIGHTNING: {
	  TYPE: 'LIGHTNING',
	  RADIUS: 19,
	  RENDER_RADIUS: 25,
	  RARITY: 5,
	  RELOAD: 2,
	  DAMAGE: 0,
	  MAX_HP: 0.1,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { 
		  LIGHTNING:  {
			  DAMAGE: 12,
			  COUNT: 5,
			  COLLIDE: true
		  }
	  }
	},
	PEAS: {
	  TYPE: 'PEAS',
	  RADIUS: 16,
	  RENDER_RADIUS: 16,
	  RARITY: 2,
	  RELOAD: 1.5,
	  DAMAGE: 12,
	  MAX_HP: 36,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { 
		SPLIT: {
			COUNT: 4,
			SPEED: 250,
			NAME: 'PEAS_SINGLE',
		}, 
		ACTION_TIME: 1.5,
		ACTION_COOLDOWN: 0.5,
	  }
	},
	PEAS_SINGLE: {
		TYPE: 'PEAS_SINGLE',
		RADIUS: 7,
		RENDER_RADIUS: 7,
		RARITY: 2,
		RELOAD: 1.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: { 
			PROJECTILE: 250,
			ACTION_TIME: 1.5,
		}
	},
	PEAS_TOXIC: {
	  TYPE: 'PEAS_TOXIC',
	  RADIUS: 16,
	  RENDER_RADIUS: 16,
	  RARITY: 3,
	  RELOAD: 1.5,
	  DAMAGE: 12,
	  MAX_HP: 36,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { 
		SPLIT: {
			COUNT: 4,
			SPEED: 250,
			NAME: 'PEAS_TOXIC_SINGLE',
		}, 
		POISON: 7,
		TOXICITY: 7,
		ACTION_TIME: 1.5,
		ACTION_COOLDOWN: 0.5,
	  }
	},
	PEAS_TOXIC_SINGLE: {
		TYPE: 'PEAS_TOXIC_SINGLE',
		RADIUS: 7,
		RENDER_RADIUS: 7,
		RARITY: 3,
		RELOAD: 1.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: { 
			PROJECTILE: 250,
			ACTION_TIME: 1.5,
			POISON: 5,
			TOXICITY: 5,
		}
	},
	PEAS_LEGENDARY: {
	  TYPE: 'PEAS_LEGENDARY',
	  RADIUS: 20,
	  RENDER_RADIUS: 20,
	  RARITY: 4,
	  RELOAD: 1.5,
	  DAMAGE: 12,
	  MAX_HP: 36,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { 
		SPLIT: {
			COUNT: 4,
			SPEED: 250,
			NAME: 'PEAS_LEGENDARY_SINGLE',
		}, 
		POISON: 20,
		TOXICITY: 9,
		ACTION_TIME: 1.5,
		ACTION_COOLDOWN: 0.5,
	  }
	},
	PEAS_LEGENDARY_SINGLE: {
		TYPE: 'PEAS_LEGENDARY_SINGLE',
		RADIUS: 10,
		RENDER_RADIUS: 10,
		RARITY: 4,
		RELOAD: 1.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: { 
			PROJECTILE: 250,
			ACTION_TIME: 1.5,
			POISON: 20,
			TOXICITY: 9,
		}
	},
	PENTA: {
	  TYPE: 'PENTA',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 4,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: false,
	  COUNT: 5,
	  TRIGGERS: {}
	},
	ROCK: {
	  TYPE: 'ROCK',
	  RADIUS: 11,
	  RENDER_RADIUS: 11,
	  RARITY: 2,
	  RELOAD: 10,
	  DAMAGE: 10,
	  MAX_HP: 90,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	ROSE: {
	  TYPE: 'ROSE',
	  RADIUS: 11,
	  RENDER_RADIUS: 11,
	  RARITY: 1,
	  RELOAD: 3.5,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { ACTION_COOLDOWN: 1, ACTION_TIME: 0.5, HEAL: 10 }
	},
	STINGER: {
	  TYPE: 'STINGER',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 1,
	  RELOAD: 4,
	  DAMAGE: 35,
	  MAX_HP: 8,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	TRI_CACTUS: {
	  TYPE: 'TRI_CACTUS',
	  RADIUS: 20,
	  RENDER_RADIUS: 20,
	  RARITY: 4,
	  RELOAD: 1,
	  DAMAGE: 5,
	  MAX_HP: 15,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: true,
	  COUNT: 3,
	  TRIGGERS: {}
	},
	TRI_STINGER: {
	  TYPE: 'TRI_STINGER',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 4,
	  RELOAD: 4,
	  DAMAGE: 35,
	  MAX_HP: 8,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: true,
	  COUNT: 3,
	  TRIGGERS: {}
	},
	TRIPLET: {
	  TYPE: 'TRIPLET',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 3,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: false,
	  COUNT: 3,
	  TRIGGERS: {}
	},
	TWIN: {
	  TYPE: 'TWIN',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 1,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: false,
	  COUNT: 2,
	  TRIGGERS: {}
	},
	DANDELION: {
	  TYPE: 'DANDELION',
	  RADIUS: 11,
	  RENDER_RADIUS: 11,
	  RARITY: 2,
	  RELOAD: 2,
	  DAMAGE: 5,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {
	    PROJECTILE: 250,
	    ACTION_TIME: 1.5,
	    ACTION_COOLDOWN: 0.5,
	    NO_HEAL: 10
	  }
	},
	MISSILE: {
	  TYPE: 'MISSILE',
	  RADIUS: 8,
	  RENDER_RADIUS: 8,
	  RARITY: 2,
	  RELOAD: 3,
	  DAMAGE: 35,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { PROJECTILE: 500, ACTION_TIME: 1.5, ACTION_COOLDOWN: 0.5 }
	},
	ROSE_ADVANCED: {
	  TYPE: 'ROSE_ADVANCED',
	  RADIUS: 11,
	  RENDER_RADIUS: 11,
	  RARITY: 3,
	  RELOAD: 3.5,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: false,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { ACTION_COOLDOWN: 1, ACTION_TIME: 0.5, HEAL: 22 }
	},
	SALT: {
	  TYPE: 'SALT',
	  RADIUS: 11,
	  RENDER_RADIUS: 11,
	  RARITY: 2,
	  RELOAD: 4,
	  DAMAGE: 10,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	IRIS: {
	  TYPE: 'IRIS',
	  RADIUS: 7,
	  RENDER_RADIUS: 7,
	  RARITY: 1,
	  RELOAD: 6,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { POISON: 60, TOXICITY: 5 }
	},
	RICE: {
	  TYPE: 'RICE',
	  RADIUS: 14,
	  RENDER_RADIUS: 20,
	  RARITY: 3,
	  RELOAD: 0,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 0,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: {}
	},
	YINYANG: {
	  TYPE: 'YINYANG',
	  RADIUS: 14,
	  RENDER_RADIUS: 14,
	  RARITY: 3,
	  RELOAD: 1,
	  DAMAGE: 15,
	  MAX_HP: 15,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { ROTATION_SWITCH: true }
	},
	FASTER: {
	  TYPE: 'FASTER',
	  RADIUS: 14,
	  RENDER_RADIUS: 9,
	  RARITY: 2,
	  RELOAD: 0.5,
	  DAMAGE: 5,
	  MAX_HP: 8,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { ROTATION_ACCELERATE: 0.8 }
	},
	LEAF: {
	  TYPE: 'LEAF',
	  RADIUS: 12,
	  RENDER_RADIUS: 12,
	  RARITY: 1,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { HEAL_SUSTAIN: 100 } // 1
	},
	POLLEN: {
	  TYPE: 'POLLEN',
	  RADIUS: 8,
	  RENDER_RADIUS: 8,
	  RARITY: 3,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: true,
	  CLUSTER: false,
	  COUNT: 3,
	  TRIGGERS: { PROJECTILE: 0.01, ACTION_TIME: 10, ACTION_COOLDOWN: 0.5 }
	},
	GLASS: {
	  TYPE: 'GLASS',
	  RADIUS: 14,
	  RENDER_RADIUS: 14,
	  RARITY: 4,
	  RELOAD: 3.5,
	  DAMAGE: 5,
	  MAX_HP: 5,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { PUNCTURE: 5, PUNCTURE_DAMAGE: 0.35 }
	},
	WING: {
	  TYPE: 'WING',
	  RADIUS: 14,
	  RENDER_RADIUS: 14,
	  RARITY: 2,
	  RELOAD: 1.25,
	  DAMAGE: 15,
	  MAX_HP: 15,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { FLOAT: 100 }
	},
	YUCCA: {
	  TYPE: 'YUCCA',
	  RADIUS: 14,
	  RENDER_RADIUS: 9,
	  RARITY: 1,
	  RELOAD: 1,
	  DAMAGE: 8,
	  MAX_HP: 10,
	  MASS: 1,
	  EXPANDABLE: true,
	  MULTIPLE: false,
	  CLUSTER: false,
	  COUNT: 1,
	  TRIGGERS: { HEAL_SUSTAIN_DEFENCE: 1.5 }
	},
	ANTENNAE: {
		TYPE: 'ANTENNAE',
		RADIUS: 10,
		RENDER_RADIUS: 10,
		RARITY: 1,
		RELOAD: 1,
		DAMAGE: 1,
		MAX_HP: 1,
		MASS: 1,
		EXPANDABLE: false,
		MULTIPLE: false,
		CLUSTER: false,
		COUNT: 1,
		TRIGGERS: {
			VISION: 2.0,
		}
	}
});
// all petal attributes are here
/*
PETAL_NAME: {
	TYPE: type, //花瓣名称
	RADIUS: radius, // 碰撞箱半径
	RENDER_RADIUS: radius, // 渲染半径
	RARITY: rarity, // 稀有度
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
		PUNCTURE: times // 百分比脆弱触发次数
		PUNCTURE_DAMAGE: dmg // 百分比脆弱倍率
		HEAL_SUSTAIN: heal // 持续恢复血量
		HEAL_SUSTAIN_DEFENCE: heal // 持续恢复血量(防御姿态)
		FLOAT: distance // 花瓣上下浮动幅度
		SPLIT: { 分裂
			COUNT 分裂数量,
			SPEED 分裂物速度,
			NAME 分裂物名称,
		},
		LIGHTNING: { 闪电
			DAMAGE 伤害,
			COUNT 连锁数量,
			COLLIDE 是否为碰撞触发，为否则由其它方式触发
		}
		SUMMON: name 召唤物名称（需要配合ACTION_COOLDOWN使用）
		VAMPIRISM: { 吸血
			HEAL 自身回血倍率
			HEAL_PLAYER 玩家回血倍率
			COLLIDE 是否为碰撞触发，为否则由其它方式触发
		},
		ROTATION_ACCELERATE: speed 花瓣旋转速度增加
		ROTATION_SWITCH: bool 是否能改变花瓣旋转模式（阴阳）
	}, 
}
*/