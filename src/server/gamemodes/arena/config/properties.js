export default Object.freeze({
	map: 'default',
	default_kit_info: { // 默认抽象花瓣信息
		size: 8,
		primary: ['stinger', 'iris', 'stinger', 'dandelion', 'cactus_toxic', 'epic_rose', 'salt', 'bubble'],
		// primary: ['faster', 'triplet', 'corn', 'heavy', 'rock', 'rice', 'leaf', 'rose'],
		// primary: ['dahlia', 'wing', 'cactus', 'triple_cactus', 'missile', 'peas', 'peas_toxic', 'peas_legendary'],
		secondary: [],
	},
	pkb: 2, // 穿透击退乘数，游戏内所有碰撞击退都会应用这个乘数
	player_natural_regen: { // 玩家自然回血
		interval: 25, // 单位:刻
		point: 1, // 单位:点
		percent: 0, // 单位:总血量百分点; 取 1 表示 1%
	},
});