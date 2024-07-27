import Entity from './entity.js';

class Player extends Entity {
	constructor(socketID, username, x, y, team, attr ) {
		super('player', x, y, team, attr);
		const $ = this.var;
		$.playerInfo = { // 玩家信息
			socketID: socketID, // socket ID
			username: username, // 用户名
		};
		$.spec = false; // 是否为观察者
		$.state = 0; // 鼠标按下情况 0:无 1:左键 2:右键 3:左右
		$.heal = { // 每刻非自然回血
			point: 0, // 点数
			percent: 0, // 总血量百分点
		};
		$.stack = {}; // 花瓣堆叠计数
	}

	setSpec(state) { // 设置是否为观察者
		const $ = this.var;
		$.spec = state;
		$.attr.ghost = true;
		$.attr.invulnerable = true;
	}

	regen() { // 非自然回血
		const $ = this.var;
		$.attr.hp = Math.min($.attr.hp + $.heal.point + $.heal.percent * $.attr.max_hp, $.attr.max_hp);
	}
}

export default Player;