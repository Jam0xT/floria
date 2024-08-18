import { downloadAssets } from './assets.js';

import './css/main.css';

window.onload = () => {
	document.body.style.cursor = "default";
	preventDefaultActions();
	Promise.all([
		downloadAssets(),
	]).then(() => {
		// .
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