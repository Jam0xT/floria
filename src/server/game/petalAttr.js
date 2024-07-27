// 实体花瓣的属性

export default Object.freeze({
	'default': { // 未设置必设置项时的默认设置
		max_hp: 10,
		radius: 8,
		mass: 10,
		dmg: 10,
		ignore_border: true,
	},
	'basic': { // 实体花瓣 id
		max_hp: 10,
		dmg: 10,
		radius: 10,
	},
	'stinger': {
		max_hp: 8,
		dmg: 35,
	},
	'light': {
		max_hp: 5,
		dmg: 8,
		radius: 5,
	},
	'corn': {
		max_hp: 2000,
		dmg: 1,
	},
	'rice': {
		max_hp: 5,
		dmg: 5,
	},
	'heavy': {
		max_hp: 200,
		dmg: 10,
		mass: 1000,
		radius: 10,
	},
	'rock': {
		max_hp: 90,
		dmg: 10,
		radius: 10,
	}
});

/*
key: 默认值
描述
hp: max_hp
血量
max_hp: 10
最大血量
radius: 10
半径（碰撞箱）
mass: 10
重量
dmg: 10
伤害
ignore_border: true
无边界碰撞
*/