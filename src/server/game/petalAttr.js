// 实体花瓣的属性

export default Object.freeze({
	'default': { // 未设置必设置项时的默认设置
		max_hp: 10,
		radius: 10,
		mass: 10,
		dmg: 10,
		ignore_border: true,
		invulnerable: false,
		poison_res: 1,
		poison: {duration: 0, dmg: 0},
		dmg_reflect: 0,
	},
	'basic': { // 实体花瓣 id
		max_hp: 10,
		dmg: 10,
	},
	'stinger': {
		max_hp: 8,
		dmg: 35,
		radius: 8,
	},
	'light': {
		max_hp: 5,
		dmg: 8,
		radius: 5,
	},
	'corn': {
		max_hp: 2000,
		dmg: 1,
		radius: 8,
	},
	'rice': {
		max_hp: 5,
		dmg: 5,
		radius: 8,
	},
	'heavy': {
		max_hp: 200,
		dmg: 10,
		mass: 1000,
	},
	'rock': {
		max_hp: 90,
		dmg: 10,
	},
	'leaf': {
		max_hp: 10,
		dmg: 8,
	},
	'iris': {
		max_hp: 5,
		dmg: 5,
		radius: 8,
	},
	'rose': {
		max_hp: 5,
		dmg: 5,
	},
	'epic_rose': {
		max_hp: 5,
		dmg: 5,
	},
	'dahlia': {
		max_hp: 5,
		dmg: 5,
		radius: 8,
	},
	'wing': {
		max_hp: 15,
		dmg: 15,
	},
	'cactus': {
		max_hp: 15,
		dmg: 5,
	},
	'faster': {
		max_hp: 5,
		dmg: 8,	
	},
	'cactus_toxic': {
		max_hp: 15,
		dmg: 5,
	},
	'salt': {
		max_hp: 10,
		dmg: 10,
	},
	'bubble': {
		max_hp: 1,
		dmg: 0,
	},
	'missile': {
		max_hp: 10,
		dmg: 35,
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