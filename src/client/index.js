import { connect, play } from './networking';
import { startRenderingMenu, startRenderGameEnter, renderConnected, renderInit, renderStartup } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';

import './css/main.css';

var isKeyboardInput = false;
var inGame = false;
var needMenu = true;

window.onload = () => {
	document.body.style.cursor = "default";
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	document.getElementById('username-input').value = window.localStorage.getItem('username') || '';
	renderStartup();
	Promise.all([downloadAssets(),]).then(() => {
		loadMenu();
	});
}

function onGameOver() {
	stopCapturingInput(isKeyboardInput);
	inGame = false;
	needMenu = true;
	loadMenu();
}

function loadMenu() {
	if ( needMenu ) {
		needMenu = false;
		renderInit();
		startRenderingMenu();
		Promise.all([
			connect(onGameOver),
		]).then(() => {
			renderConnected();
			window.onkeydown = e => {
				if ( e.key == 'Enter' ) {
					if ( inGame == false ) {
						let username = document.getElementById('username-input').value;
						window.localStorage.setItem('username', username);
						if ( username != '' )
							play(username);
						else
							play('Random Flower');
						inGame = true;
						initState();
						startRenderGameEnter();
						startCapturingInput(isKeyboardInput);
					}
				}
			}
		}).catch(() => {
			console.log('Connect failed.');
			window.setTimeout(loadMenu, 1000);
		});
	}
}