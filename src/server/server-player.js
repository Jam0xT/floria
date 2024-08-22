import { randomUUID } from "crypto";
import log from './log.js';

/*
export type ConnectionState = `connected` | `disconnected`; //玩家连接状态

//不在房间中，在房间中但没有准备，在房间中且准备，在游戏中
export type GameState = `idle` | `waiting` | `ready` | `inGame`;
*/
class Player {
	uuid = randomUUID();
	
	connectionState = `connected`;
	
	gameState = `idle`;
	
	inGameEntity;
	
	room;
	
	game; //待定
	
	team;
	
	username = ``;
	
	ws;
	
	delayRemove; 
	
	constructor() {
		
	}
	
	getData() {
		return {
			username: this.username,
			uuid: this.uuid,
			isReady: this.gameState == `ready` ? true : false
		}
	}
	
	setUsername(newName) {
		//判断用户名是否可用
		const isUsernameAvailable = Player.getUsernameUsability(newName);
		if (!isUsernameAvailable) return false;
		this.username = newName;
		return true
	}
	
	//玩家列表
	static list = {}
	
	//玩家重连方法
	static tryReconnect(ws, uuid) {
		const player = Player.list[uuid];
		if (player) {
			player.connectionState = `connected`; //设定玩家状态为连接
			ws.player = player;
			return true;
		}
		return false;
	}
	
	//创建新玩家并加入列表
	static createNewPlayer(ws) {
		const newPlayer = new Player();
		Player.list[newPlayer.uuid] = newPlayer;
		newPlayer.ws = ws;
		ws.player = newPlayer;
		console.log(`${log.green('+')} ${log.gray(newPlayer.uuid)}`);
		return newPlayer;
	}
	
	static removePlayer(player) {
		delete this.list[player.uuid];
	}
	
	//延迟移除玩家
	static createDelayRemove(player) {
		const delay = 10 * 1000;
		const delayRemove = setTimeout(() => { Player.removePlayer(player); }, delay);
		player.delayRemove = delayRemove;
	}
	
	static removeDelayRemove(player) {
		if (player.delayRemove) {
			clearTimeout(player.delayRemove);
			player.delayRemove = undefined;
		}
	}
	
	static getUsernameUsability(username) { //防止傻逼抓包传神秘的东西
		if (typeof username != `string` && typeof username != `number` ) return false;
		return true;
	}
}

export default Player;