import * as util from './utility.js';
import Room from './room/room.js';
import App from './render/app.js';

class Client {
	// 游戏标题 用于一些地方渲染
	title;

	// 游戏模式 id
	gamemode;

	// 自身用户名
	username;

	// 锁在房间
	room;

	// pixi app
	app;

	constructor(title) {
		this.title = title;
		this.gamemode = '';
		this.username = util.getStorage('username');
		this.room = new Room();
		this.app = new App();
	}

	setUsername(username) {
		this.username = username;
		util.setStorage('username', username);
	}

	setGamemode(gamemode) {
		this.gamemode = gamemode;
	}
}

export default Client;