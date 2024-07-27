// 花瓣信息 也就是 抽象花瓣的属性

export default Object.freeze({
	'default': { // 默认值
		cd: 25,
		count: 1,
		pattern: 0,
		angle: 0,
		rot_speed: 0.05,
		orbit_extra: 0,
		sub_orbit: 10,
	},
	'basic': {
		cd: 62,
	},
	'stinger': {
		cd: 100,
	},
	'triple_stinger': {
		instance_id: 'stinger',
		cd: 100,
		count: 3,
		pattern: 1,
	},
	'fast': {
		instance_id: 'light',
		cd: 12,
	},
	'twin': {
		instance_id: 'light',
		cd: 25,
		count: 2,
	},
	'triplet': {
		instance_id: 'light',
		cd: 25,
		count: 3,
	},
	'penta': {
		instance_id: 'light',
		cd: 25,
		count: 5,
	},
});

/*
'basic': { 					// key 与抽象花瓣 id 对应
	id: 'basic', 			// 抽象花瓣 id
	instance_id: 'basic', 	// 实体花瓣 id
	cd: 62, 				// 单位:刻 冷却时间 1 为瞬间重生 设置为 <= 0 可能会导致一些问题
	cd_remain: [], 			// 各实例剩余冷却时间
	count: 3,				// 数量，等于 1 表示单子，多于 1 表示多子
	pattern: 0, 			// 多子形态，0 表示分散，1 表示聚合
	angle: 0,				// 多子花瓣的亚轨道起始角度
	rot_speed: 0.05,		// 亚轨道旋转速度 单位:弧度 / 刻
	orbit_extra: 0,			// 额外轨道半径
	sub_orbit: 0,			// 亚轨道半径
	special: {},			// 特殊技能
},
special: {
	'trigger': [
		{
			stage: 0,
			events: [
				
			],
			conditions: [
			],
		}
	]
},
*/