// 花瓣技能

export default Object.freeze({
	'leaf': {
		'onFirstLoad': [
			// 首次 load 时增加 0.04 点每刻自然回血
			function (petal) {
				const $ = this.var;
				const player = $.entities[petal.var.parent];
				player.var.heal.point += 1;
			},
		],
		'onUnequip': [
		],
	},
});

/*
花瓣技能属于抽象花瓣，根据抽象花瓣的 id 来判定技能组

触发器列表
onFirstLoad		// 首次加载
*/