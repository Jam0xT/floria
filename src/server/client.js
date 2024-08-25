import { randomUUID } from "crypto";

class Client {
	uuid = randomUUID();

	ws;

	room;

	username;
	
	constructor(ws) {
		this.ws = ws;
		ws.client = this;
	}

	setUsername(text) {
		if ( (typeof text) != 'string' && (typeof text) != 'number' )
			return false;
		this.username = text;
		return true;
	}

	setRoom(room) {
		this.room = room;
	}
	
	// getData() {
	// 	return {
	// 		username: this.username,
	// 		uuid: this.uuid,
	// 		isReady: this.gameState == `ready` ? true : false
	// 	}
	// }
	
	// setUsername(newName) {
	// 	//判断用户名是否可用
	// 	const isUsernameAvailable = Player.getUsernameUsability(newName);
	// 	if (!isUsernameAvailable) return false;
	// 	this.username = newName;
	// 	return true
	// }
	
	// //玩家列表
	// static list = {}
	
	// //创建新玩家并加入列表
	// static createNewPlayer(ws) {
	// 	const newPlayer = new Player();
	// 	Player.list[newPlayer.uuid] = newPlayer;
	// 	newPlayer.ws = ws;
	// 	ws.player = newPlayer;
	// 	console.log(`${log.green('+')} ${log.gray(newPlayer.uuid)}`);
	// 	return newPlayer;
	// }
	
	// static removePlayer(player) {
	// 	delete this.list[player.uuid];
	// }
	
	// //延迟移除玩家
	// static createDelayRemove(player) {
	// 	const delay = 10 * 1000;
	// 	const delayRemove = setTimeout(() => { Player.removePlayer(player); }, delay);
	// 	player.delayRemove = delayRemove;
	// }
	
	// static removeDelayRemove(player) {
	// 	if (player.delayRemove) {
	// 		clearTimeout(player.delayRemove);
	// 		player.delayRemove = undefined;
	// 	}
	// }
	
	// static getUsernameUsability(username) { //防止傻逼抓包传神秘的东西
	// 	if (typeof username != `string` && typeof username != `number` ) return false;
	// 	return true;
	// }
}

export default Client;