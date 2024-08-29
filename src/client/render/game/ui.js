import * as pixi from 'pixi.js';
import * as nw from '../../networking.js';
import Constants from '../../../shared/constants.js';

class UI {
	container = new pixi.Container();

	game;

	constructor(game) {
		this.game = game;
	}

	startCapturingInput() {
		window.addEventListener('mousemove', this.onMouseMove.bind(this));
		window.addEventListener('mousedown', this.onMouseDown.bind(this));
		window.addEventListener('mouseup', this.onMouseUp.bind(this));
		// window.addEventListener('keydown', onKeyDown);
		// window.addEventListener('keyup', onKeyUp);
	}

	stopCapturingInput() {
		window.removeEventListener('mousemove', this.onMouseMove.bind(this));
		window.removeEventListener('mousedown', this.onMouseDown.bind(this));
		window.removeEventListener('mouseup', this.onMouseUp.bind(this));
		// window.removeEventListener('keydown', onKeyDown);
		// window.removeEventListener('keyup', onKeyUp);
	}

	// ticker
	update() {
		
	}

	onMouseMove(e) {
		const dpr = window.devicePixelRatio;
		const x = e.clientX, y = e.clientY;
		const w = window.innerWidth, h = window.innerHeight;
		const dir = Math.atan2(y - h / 2, x - w / 2);
		const dx = x - w / 2, dy = y - h / 2;
		const d = Math.sqrt(dx * dx + dy * dy); // 鼠标到屏幕中心的距离
		const maxd = 100 / dpr; // power 为 100 时的距离
		const power = Math.min(maxd, d) / maxd; // [0, 1] 范围内的值，为玩家速度乘数

		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.GAME.INPUT, {
			type: 0,
			value: {
				dir: dir,
				power: power,
			},
		});
	}
	
	onMouseDown(e) {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.GAME.INPUT, {
			type: 1,
			value: (e.buttons & 3),
		});
	}
	
	onMouseUp(e) {
		nw.sendWsMsg(Constants.MSG_TYPES.CLIENT.GAME.INPUT, {
			type: 1,
			value: (e.buttons & 3),
		});
	}
}

export default UI;