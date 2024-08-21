import * as util from './utility.js';
import Room from './room/room.js';
import App from './render/app.js';

// 主菜单，寻找房间，等待服务器返回房间信息，房间中，游戏中，错误
const legalStates = ['main', 'get_room', 'to_room', 'room', 'game', 'err'];

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

	// 客户端状态 (所在界面)
	state;

	constructor(title) {
		this.title = title;
		this.gamemode = '';
		this.username = util.getStorage('username');
		this.state = 'main';
		this.room = new Room();
		this.app = new App();
	}

	setUsername(username) {
		this.username = username;
		util.setStorage('username', username);
	}

	setGamemode(gamemode) {
		this.gamemode = gamemode;
		this.app.roomMenu.gamemodeText.set(gamemode);
	}

	setState(state) {
		if ( legalStates.includes(state) ) {
			this.state = state;
		} else {
			throw new Error(`Settings client to unknown state '${state}'`);
		}
	}

	onRoomUpdate(value) {
		if ( this.state == 'to_room' ) {
			this.state = 'room';
			this.app.toRoomMenu.off();
			this.app.roomMenu.on();
		}
	}
}

export default Client;