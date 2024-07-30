import { W, H, ctxMain } from './canvas.js';

let unsecuredCopyWarned = false; // 防止报错刷屏

function copyToClipboard(text) {
	if ( navigator.clipboard ) {
		navigator.clipboard.writeText(text);
	} else {
		if ( !unsecuredCopyWarned ) { // 不安全复制方法
			console.log('USING UNSECURE COPY METHOD');
			unsecuredCopyWarned = true;
		}
		unsecuredCopyToClipboard(text);
	}
}

function shakeScreen(duration = 200, intensity = 10) {
	const startTime = Date.now();
	const canvas = ctxMain.canvas;
	function shake() {
	    const elapsed = Date.now() - startTime;
	    const amplitude = 1 - elapsed / duration
		const randomX = (Math.random() - 0.5) * 2 * amplitude * intensity
		const randomY = (Math.random() - 0.5) * 2 * amplitude * intensity
		
	    canvas.style.transform = `translate(${randomX}px, ${randomY}px)`;
	
	    if (elapsed < duration) {
	        requestAnimationFrame(shake);
	    } else {
	        canvas.style.transform = 'translateX(0)';
	    }
	}
    shake();
}

function unsecuredCopyToClipboard(text) {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try {
		document.execCommand('copy');
	} catch (err) {
		console.error('Unable to copy to clipboard', err);
	}
	document.body.removeChild(textArea);
  }

function fillBackground(ctx, fillStyle) {
	ctx.fillStyle = fillStyle;
	ctx.fillRect(0, 0, W, H);
}

function setStorage(key, value) {
	window.localStorage.setItem(key, value);
}

function getStorage(key, preset) {
	return window.localStorage.getItem(key) ?? preset;
}

export {
	copyToClipboard,
        shakeScreen
	fillBackground,
	setStorage,
	getStorage,
}