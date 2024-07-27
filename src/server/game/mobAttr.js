// 生物默认属性表 参考 entity.js

export default Object.freeze({
	default: {
		max_hp: 100,
		radius: 20,
		vision: 1000,
		mass: 100,
		speed: 2000,
		ghost: false,
		ignore_border: false,
		rot_speed: 0.1,
		orbit: [50, 100, 25, 100],
		invulnerable: false,
		poison_res: 0,
		poison: {duration: 0, dmg: 0},
		dmg_reflect: 0,
	},
	player: { // 玩家
		hp: 150,
		max_hp: 150,
		radius: 20,
		vision: 2000,
		mass: 100,
		dmg: 25,
		speed: 2000,
		rot_speed: 0.1,
		orbit: [50, 100, 25, 100],
	},
});