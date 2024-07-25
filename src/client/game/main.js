import * as util from '../utility.js';
import { getCurrentState } from '../state.js';
import { renderBackground } from './render/background.js';
import { renderPlayer } from './render/player.js';
import { renderPetal } from './render/petal.js';

let settings;
let animationFrameRequestID;

function initGameSettings(settings_) { // 游戏开始时获取的游戏设定信息
	settings = settings_;
}

function startRenderGame() { // 开始游戏
	animationFrameRequestID = requestAnimationFrame(render);
}

function render() {
	const state = getCurrentState();
	if ( state.self ) {
		renderBackground(state.self.x, state.self.y);
		renderPlayer(state.self, state.self);
		state.entities.forEach(e => {
			if ( e.type == 'player' ) {
				renderPlayer(state.self, e);
			} else if ( e.type == 'petal' ) {
				renderPetal(state.self, e);
			}
		});
	}
	animationFrameRequestID = requestAnimationFrame(render);
}

function stop() {
	cancelAnimationFrame(animationFrameRequestID);
}

export {
	startRenderGame,
	initGameSettings,
	settings,
};