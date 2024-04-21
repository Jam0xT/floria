import { connect, play } from './networking';
// import { startRenderingMenu, startRenderGameEnter, renderConnected, renderInit, renderStartup } from './render';
import * as render from './render';
import { stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { initCmd } from './cmd';

import './css/main.css';

var inGame = false;
var needMenu = true;

window.onload = () => {
	document.body.style.cursor = "default";
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	document.getElementById('username-input').value = window.localStorage.getItem('username') || '';
	render.renderStartup();
	Promise.all([downloadAssets(),]).then(() => {
		loadMenu();
	});
}

function onGameOver() {
	stopCapturingInput();
	inGame = false;
	needMenu = true;
	loadMenu();
}

function loadMenu() {
	if ( needMenu ) {
		needMenu = false;
		render.renderInit();
		render.startRenderingMenu();
		Promise.all([
			connect(onGameOver),
		]).then(() => {
			render.renderConnected();
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
						initCmd();
						render.startRenderGameEnter();
					}
				}
			}
		}).catch(() => {
			console.log('Connect failed.');
			window.setTimeout(loadMenu, 1000);
		});
	}
}