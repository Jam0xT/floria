// 花瓣技能

export default Object.freeze({
	'leaf': {
		'onFirstLoad': [
			// 首次 load 时增加 0.04 点每刻自然回血
			function (petal) {
				const $ = this.var;
				const player = $.entities[petal.var.parent];
				player.var.heal.point += 0.04;
			},
		],
		'onUnequip': [
			// unequip 时减少 0.04 点每刻自然回血
			function (petal) {
				const $ = this.var;
				const player = $.entities[petal.var.parent];
				player.var.heal.point -= 0.04;
			},
		],
	},
	'iris': {
		'onHit': [
			// 击中目标时给予中毒效果 duration 150 dmg 0.4
			function (petal, target) {
				target.poison(150, 0.4);
			}
		],
	},
});

/*
花瓣技能属于抽象花瓣，根据抽象花瓣的 id 来判定技能组

触发器列表
onFirstLoad		// 首次加载
onHit			// 击中目标
*/