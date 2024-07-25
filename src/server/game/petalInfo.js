// 抽象花瓣的属性

export default Object.freeze({
	'basic': { // key 与抽象花瓣 id 对应
		id: 'basic', // 抽象花瓣 id
		instance_id: 'basic', // 实体花瓣 id
		cd: 62, // = 2.48s 单位 刻 冷却时间
		cd_remain: [], // 各实例剩余冷却时间
		count: 1, // 数量，等于 1 表示单子，多于 1 表示多子
		pattern: 0, // 多子形态，0 表示分散，1 表示聚合
		special: [], // 特殊技能合集
	},
});