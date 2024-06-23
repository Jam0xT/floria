// 公用方法

function random(l, r) {
	return Math.random() * (r - l) + l;
}

function randomInt(l, r) {
	return Math.floor(random(l, r + 1));
}

export {
	random,
	randomInt,
}