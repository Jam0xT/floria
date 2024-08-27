class StateProcessor {
	gameUpdates = [];

	gameStart = 0;

	firstServerTimeStamp = 0;

	renderDelay = 150;

	valueKeys = ['x', 'y', 'hp', 'max_hp', 'radius', 'vision'];
	dirKeys = [];

	constructor() {}

	reset() {
		this.gameStart = 0;
		this.firstServerTimeStamp = 0;
		this.gameUpdates = [];
	}

	// 处理原始更新数据
	process(update) {
		if ( !this.firstServerTimeStamp ) {
			this.firstServerTimeStamp = update.t;
			this.gameStart = Date.now();
		}

		this.gameUpdates.push(update);

		const base = this.getBaseUpdateIndex();
		if ( base > 0 ) {
			this.gameUpdates.splice(0, base);
		}
	}

	// 获取插入过后的当前状态信息
	get() {
		if ( !this.firstServerTimeStamp ) {
			return ;
		}

		const baseUpdateIndex = this.getBaseUpdateIndex();
		const serverTime = this.getCurrentServerTime();

		const gameUpdates = this.gameUpdates;
	
		if ( baseUpdateIndex < 0 || baseUpdateIndex === gameUpdates.length - 1) {
			return gameUpdates[gameUpdates.length - 1];
		} else {
			const baseUpdate = gameUpdates[baseUpdateIndex];
			const nextUpdate = gameUpdates[baseUpdateIndex + 1];
			const ratio = (serverTime - baseUpdate.t) / (nextUpdate.t - baseUpdate.t);
			return this.interpolateObject(baseUpdate, nextUpdate, ratio);
		}
	}

	getCurrentServerTime() {
		const currentServerTime = this.firstServerTimeStamp + (Date.now() - this.gameStart) - this.renderDelay;
		return currentServerTime;
	}

	getBaseUpdateIndex() {
		const serverTime = this.getCurrentServerTime();
		const gameUpdates = this.gameUpdates;
		for (let i = gameUpdates.length - 1; i >= 0; i -- ) {
			if ( gameUpdates[i].t <= serverTime ) {
				return i;
			}
		}
		return -1;
	}

	interpolateObject(object1, object2, ratio) {
		if ( !object2 ) {
			return object1;
		}
	
		const interpolated = {};
		Object.keys(object1).forEach(key => {
			if ( this.dirKeys.includes(key) ) { // 方向
				interpolated[key] = this.interpolateDirection(object1[key], object2[key], ratio);
			} else if ( this.valueKeys.includes(key) ) { // 数值
				interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
			} else if (	Array.isArray(object1[key]) ) { // Array
				interpolated[key] = this.interpolateObjectArray(object1[key], object2[key], ratio);
			} else if ( (typeof object1[key]) === 'object' ) { // Object
				interpolated[key] = this.interpolateObject(object1[key], object2[key], ratio);
			} else {
				interpolated[key] = object1[key];
			}
		});
		return interpolated;
	}
	
	interpolateObjectArray(objects1, objects2, ratio) {
		return objects1.map(object1 => this.interpolateObject(object1, objects2.find(object2 => object1.uuid == object2.uuid), ratio));
	}
	
	interpolateDirection(d1, d2, ratio) {
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
}

export default StateProcessor;