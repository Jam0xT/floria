import * as util from './utility.js';
import Room from './room.js';
import App from './render/app.js';
import * as gameState from './render/game/state_old.js';

// 主菜单，寻找房间，等待服务器返回房间信息，房间中，游戏中，错误
const legalStates = ['main', 'get_room', 'to_room', 'room', 'game', 'err'];

class Client {
	// 游戏标题 用于一些地方渲染
	title;

	// 游戏模式 id
	gamemode;

	// 客户端 uuid
	uuid;

	// 自身用户名
	username;

	// 所在房间
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
		this.app.roomMenu.setGamemode(gamemode);
	}

	setState(state) {
		if ( legalStates.includes(state) ) {
			this.state = state;
		} else {
			throw new Error(`Settings client to unknown state '${state}'`);
		}
	}

	onConnect(data) {
		this.uuid = data.uuid;
	}

	onJoinRoom(data) {
		if ( this.state == 'to_room' ) {
			if ( data.result == 0 ) {
				this.state = 'room';
				this.room.onJoin(data.room);
				this.app.toRoomMenu.off();
				this.app.roomMenu.on();
			} else {
				this.state = 'err';
				this.app.errorMenu.setText(`Join failed with error code: ${data.result}.`);
				this.app.toRoomMenu.off();
				this.app.errorMenu.on();
			}
		}
	}

	onLeaveRoom() {
		if ( this.state == 'room' ) {
			this.state = 'get_room';
			this.app.roomMenu.off();
			this.app.mainMenu.on();
		}
	}

	onPlayerJoinRoom(data) {
		if ( this.state == 'room' ) {
			this.room.addPlayer(data.player);
		}
	}

	onPlayerLeaveRoom(data) {
		if ( this.state =='room' ) {
			this.room.removePlayer(data.player);
		}
	}

	onPlayerReady(data) {
		if ( this.state == 'room' ) {
			this.room.playerReady(data.player);
		}
	}

	onSettingsUpdate(data) {
		if ( this.state == 'room' ) {
			this.room.updateSettings(data);
		}
	}

	onRoomStart(data) {
		if ( this.state == 'room' ) {
			this.state = 'game';
			this.app.game.reset();
			this.app.game.setTeamColors(data.teamColors);
			this.app.roomMenu.off();
			this.app.game.on();
		}
	}

	onGameInit(data) {
		if ( this.state == 'game' ) {
			this.app.game.init(data);
		}
	}

	onGameUpdate(data) {
		if ( this.state == 'game' ) {
			this.app.game.processRawUpdate(data);
		}
	}

	onGameOver(data) {
		if ( this.state == 'game' ) {
			// array data.winners
			this.app.game.off();
			this.app.gameEndMenu.on();
		}
	}
}

export default Client;