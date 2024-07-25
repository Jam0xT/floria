export default Object.freeze({
	tick_per_second: 25, // 游戏 tps
	map_width: 1000, // 地图宽度
	map_height: 1000, // 地图高度
	chunk_size: 200,
	default_petals: { // 默认花瓣
		count: 5,
		primary: new Array(5).fill('basic'),
		secondary: new Array(5).fill(''),
	},
	friction: 0.7, // 摩擦力
	knockback: 1, // 击退系数
});