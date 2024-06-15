import * as nw from './networking.js';

import render from './render.js';

// import { stopCapturingInput } from './input.js';

import { downloadAssets } from './assets.js';

import { initState } from './state.js';

import * as room from './render/room.js';

// import { initCmd } from './cmd.js';

import './css/main.css';

window.onload = () => {
	document.body.style.cursor = "default";
	preventDefaultActions();
	document.getElementById('username-input').value = window.localStorage.getItem('username') || '';
	Promise.all([
		downloadAssets(),
		render.init(),
	]).then(() => {
		document.getElementById('text-loading').classList.add('hidden');
		render.loadStartScreen();
		room.recieveInfo();
	});
}

function preventDefaultActions() {
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	window.addEventListener('contextmenu', (event) => {
		event.preventDefault();
	});
}

// function onGameOver() {
// 	// stopCapturingInput();
// 	// loadMenu();
// }

// function connectToServer() {
// 	Promise.all([
// 		nw.connect(onGameOver),
// 	]).then(() => {
// 		// ...
// 	}).catch(() => {
// 		console.log('Connect failed.');
// 		// window.setTimeout(loadMenu, 1000);
// 	});
// }

// function joinGame() {
// 	Promise.all([
// 		initState(),
// 		// initCmd(),
// 	]).then(() => {
// 		let username = document.getElementById('username-input').value;
// 		window.localStorage.setItem('username', username);
// 		if ( username != '' )
// 			nw.play(username);
// 		else
// 			nw.play('Random Flower');
// 	}).catch(() => {
// 		console.log('Error 0');
// 	});
// }

function waitForKeyPress(key) {
	return new Promise(resolve => {
		window.addEventListener('keydown', keyPressHandler);
		let keyPressHandler = e => {
			if ( e.key == key ) {
				window.removeEventListener('keydown', keyPressHandler);
				resolve();
			}
		}
	});
}