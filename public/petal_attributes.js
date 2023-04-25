module.exports = Object.freeze({
	BASIC: {
		RADIUS: 8,
		RELOAD: 2.5,
		DAMAGE: 10,
		MAX_HP: 10,
		MASS: 1,
		COLLISION_KNOCKBACK: 10,
		TYPE: 'BASIC',
		ATTRIBUTES: {},
	},
	TWIN: {
		RADIUS: 5,
		RELOAD: 1,
		DAMAGE: 8,
		MAX_HP: 5,
		MASS: 1,
		COLLISION_KNOCKBACK: 10,
		TYPE: 'TWIN',
		ATTRIBUTES: {
			multiple_object: 2,
		}
	}
});
// all petal attributes are here
/*
PETAL_NAME: {
	RADIUS: radius, // 碰撞箱半径
	RELOAD: reload, // 单位为秒，刷新时间
	DAMAGE: dmg, // 物理伤害
	MAX_HP: max_hp, // 自生血量
	MASS: mass, // 击退抗性
	COLLISION_KNOCKBACK: knockback, // 击退
	TYPE: type, //花瓣名称
	ATTRIBUTES: { // 特殊属性
		multiple_object: //多子
	},
}
*/