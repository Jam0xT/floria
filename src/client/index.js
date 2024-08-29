import Client from './client.js';
import { downloadAssets } from './assets_old.js';
import './css/main.css';

window.onload = onLoad;

const client = new Client('floria.io');

function onLoad() {
	document.body.style.cursor = "default";
	preventDefaultActions();
}

function preventDefaultActions() {
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	window.addEventListener('contextmenu', (event) => {
		event.preventDefault();
	});
}

export default client;