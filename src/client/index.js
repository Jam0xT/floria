import { connect, play } from './networking';
import { startRenderingMainMenu, startRenderingGame } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
// leaderboard

import './css/main.css';

const usernameInput = document.getElementById('username-input');
var isKeyboardInput = false;

Promise.all([
	connect(onGameOver),
	downloadAssets(),
]).then(() => {
	startRenderingMainMenu();
	usernameInput.classList.remove('hidden');
	usernameInput.focus();
	window.onkeyup = e => {
		if ( e.keyCode == 16 && e.location == KeyboardEvent.DOM_KEY_LOCATION_RIGHT ) {
			isKeyboardInput = false;
		}
	}
	window.onkeydown = e => {
		if ( e.keyCode == 16 && e.location == KeyboardEvent.DOM_KEY_LOCATION_RIGHT ) {
			isKeyboardInput = true;
		}
		if ( e.keyCode == 13) {
			if(usernameInput.value == '') {
				play('Random Flower');
			} else {
				play(usernameInput.value);
			}
			usernameInput.classList.add('hidden');
			initState();
			startRenderingGame();
			startCapturingInput(isKeyboardInput);
		}
	}
}).catch(console.error);

function onGameOver() {
	stopCapturingInput(isKeyboardInput);
	window.location.reload();
}