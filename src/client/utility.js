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

class DynamicNumber {
	constructor (value, target = value, mode = 'exp', k = 0.8) {
		this.value = value;
		this.target = target;
		this.mode = mode;
		this.k = k;
		this.isDone = (value == target);
	}
	
	to(newTarget) {
		this.isDone = false;
		this.target = newTarget;
	}
	
	get() {
		if (this.isDone) return this.target
		
		if (this.mode == `exp`) {
			this.value = this.target - (this.target - this.value) * this.k;
		}
		
		if (Math.abs(this.value - this.target) < 0.01) this.isDone = true;
		
		
		return this.value;
	}
	
	set(newValue) {
		this.isDone = false;
		this.value = newValue;
	}
	
	static create(value, target = value, k = 0.8, mode = `exp`) {
		return new DynamicNumber(value, target, mode, k);
	}
}

/*
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
*/

function setStorage(key, value) {
	window.localStorage.setItem(key, value);
}

function getStorage(key, preset = null) {
	const value = window.localStorage.getItem(key);
	if ( value === null ) {
		setStorage(key, preset);
		return preset;
	}
	return value;
}

export {
	copyToClipboard,
	DynamicNumber,
	setStorage,
	getStorage,
}