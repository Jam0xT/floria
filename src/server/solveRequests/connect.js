import Player from "../server-player.js";

export default function onPlayerConnect(value, ws) {
	const uuid = value.self.uuid
	const isReconnectionSuccess = Player.tryReconnect(ws, uuid);
	
	if (isReconnectionSuccess) {
		Player.removeDelayRemove(ws.player);
		return
	} 
	
	//为新连接，创建玩家
	const player = Player.createNewPlayer(ws);
	// player.setUsername(value.self.username);
}