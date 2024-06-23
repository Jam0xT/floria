import properties from './properties.js'; // 游戏相关设置
import * as time from '../../game/time.js'; // 时间相关方法

class Game_Arena {
	constructor() {
		this.var = {};
		this.init();
	}

	init() {
		this.var.prop = properties;
		time.init.bind(this)();
	}

	start() { // 开始游戏
		setInterval(this.update.bind(this), 1000 / this.var.prop.tick_per_second); // 开启游戏主循环
	}

	update() {
		time.update.bind(this)();
		const dt = this.var.time.dt;
	}
}

export default Game_Arena;