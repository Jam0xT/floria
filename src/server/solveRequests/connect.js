import Player from "../server-player.js";
import { createData } from "../server.js";
import Constants from "../../shared/constants.js";

export default function onPlayerConnect(value, ws) {
	const uuid = value.self.uuid
	const isReconnectionSuccess = Player.tryReconnect(ws, uuid);
	
	if (isReconnectionSuccess) {
		Player.removeDelayRemove(ws.player);
		return
	} 
	
	//为新连接，创建玩家
	const player = Player.createNewPlayer(ws);
	ws.send(createData(
		Constants.MSG_TYPES.SERVER.CONNECT,
		{
			data: {
				uuid: player.uuid,
			}
		}
	));
	// player.setUsername(value.self.username);
}