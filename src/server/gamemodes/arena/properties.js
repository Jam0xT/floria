export default Object.freeze({
	tick_per_second: 25, // 游戏 tps
	map_width: 1000, // 地图宽度
	map_height: 1000, // 地图高度
	chunk_size: 200, // 区块大小 用于碰撞判定
	default_kit_info: { // 默认抽象花瓣信息
		size: 5,
		primary: new Array(5).fill('basic'),
		secondary: new Array(5).fill(''),
	},
	/*
		以下几个参数决定游戏的物理引擎，含义与现实生活不同，具体请参考下方注释
	*/
	friction: 0.7,
	/*
		摩擦系数，影响一般情况下的移动，取值范围[0, 1)
		该参数越大，移动越"漂"
		取值 >= 1 时将会无限加速
		取值 = 0 时将会无法移动
	*/
	knockback: 1,
	/*
		击退系数，影响碰撞时弹开的瞬时速度，取值范围无限制
		与碰撞时弹开的瞬时速度成正比
	*/
	elasticity: 0.7,
	/*
		弹性系数，影响碰撞时弹开的速度衰减，取值范围[0, 1)
		碰撞时弹开的衰减速度随着 该参数的减小 而增加
		取值 = 1 时碰撞后摊开的速度不会衰减
		取值 = 0 时碰撞后弹开的速度只持续 1 刻
	*/
	player_natural_regen: { // 玩家自然回血
		interval: 25, // 单位:刻
		point: 1, // 单位:点
		percent: 1, // 单位:总血量百分点; 取 1 表示 1%
	},
	petal_speed: 100, // 花瓣追踪速度乘数
	ghost_friendly_petal: true, // 同队花瓣无碰撞
});