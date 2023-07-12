import { RENDER_DELAY } from '../shared/constants';

const gameUpdates = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export function initState() {
	gameStart = 0;
	firstServerTimestamp = 0;
}

export function processGameUpdate(update) {
	if ( !firstServerTimestamp ) {
		firstServerTimestamp = update.t;
		gameStart = Date.now();
	}
	gameUpdates.push(update);

	const base = getBaseUpdateIndex();
	if ( base > 0 ) {
		gameUpdates.splice(0, base);
	}
}

function currentServerTime() {
	return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

function getBaseUpdateIndex() {
	const serverTime = currentServerTime();
	for ( let i = gameUpdates.length - 1; i >= 0; i--) {
		if ( gameUpdates[i].t <= serverTime) {
			return i;
		}
	}
	return -1;
}

export function getCurrentState() {
	if ( !firstServerTimestamp ) {
		return [];
	}

	const baseUpdateIndex = getBaseUpdateIndex();
	const serverTime = currentServerTime();

	if ( baseUpdateIndex < 0 || baseUpdateIndex === gameUpdates.length - 1) {
		return gameUpdates[gameUpdates.length - 1];
	} else {
		const baseUpdate = gameUpdates[baseUpdateIndex];
		const nextUpdate = gameUpdates[baseUpdateIndex + 1];
		const ratio = (serverTime - baseUpdate.t) / (nextUpdate.t - baseUpdate.t);
		return {
			me: interpolateObject(baseUpdate.me, nextUpdate.me, ratio),
			others: interpolateObjectArray(baseUpdate.others, nextUpdate.others, ratio),
			mobs: interpolateObjectArray(baseUpdate.mobs, nextUpdate.mobs, ratio),
			leaderboard: baseUpdate.leaderboard,
			playerCount: baseUpdate.playerCount,
			rankOnLeaderboard: baseUpdate.rankOnLeaderboard,
		};
	}
}

function interpolateObject(object1, object2, ratio) {
	if ( !object2 ) {
		return object1;
	}

	const interpolated = {};
	Object.keys(object1).forEach(key => {
		if ( key === 'activeDirection' || key === 'dir' ) {
			interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
		} else if ( key === 'x' || key === 'y' || key === 'hp' || key === 'score' || key === 'maxHp' ) {
			interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
		} else if ( key == 'petals' ) {
			interpolated[key] = interpolateObjectArray(object1[key], object2[key], ratio);
		} else {
			interpolated[key] = object1[key];
		}
	});
	return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio) {
	return objects1.map(object1 => interpolateObject(object1, objects2.find(object2 => object1.id === object2.id), ratio));
}

function interpolateDirection(d1, d2, ratio) {
	const absD = Math.abs(d2 - d1);
	if ( absD >= Math.PI ) {
		if ( d1 > d2 ) {
			return d1 + (d2 + 2 * Math.PI - d1) * ratio;
		} else {
			return d1 - (d2 - 2 * Math.PI - d1) * ratio;
		}
	} else {
		return d1 + (d2 - d1) * ratio;
	}
}