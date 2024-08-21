class Player { // 房间中的玩家信息类
	username;
	isReady;
	constructor(username) {
		this.username = username;
		this.isReady = false;
	}

	ready(toState = true) { // 设置 isReady 状态
		this.isReady = toState;
	}
};

export default Player;