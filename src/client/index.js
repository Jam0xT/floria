import { connect, play } from './networking.js';

import render from './render.js';

// import { stopCapturingInput } from './input.js';

import { downloadAssets } from './assets.js';

import { initState } from './state.js';

// import { initCmd } from './cmd.js';

import './css/main.css';

window.onload = () => {
	document.body.style.cursor = "default";
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	document.getElementById('username-input').value = window.localStorage.getItem('username') || '';
	Promise.all([
		downloadAssets(),
		render.init(),
	]).then(() => {
		document.getElementById('text-loading').classList.add('hidden');
		render.loadStartScreen();
	});
}

function onGameOver() {
	// stopCapturingInput();
	// loadMenu();
}

function connectToServer() {
	Promise.all([
		connect(onGameOver),
	]).then(() => {
		// ...
	}).catch(() => {
		console.log('Connect failed.');
		// window.setTimeout(loadMenu, 1000);
	});
}

function joinGame() {
	Promise.all([
		initState(),
		// initCmd(),
	]).then(() => {
		let username = document.getElementById('username-input').value;
		window.localStorage.setItem('username', username);
		if ( username != '' )
			play(username);
		else
			play('Random Flower');
	}).catch(() => {
		console.log('Error 0');
	})
}

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