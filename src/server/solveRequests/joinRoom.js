import * as roomManager from "../roomManager.js";
import Constants from "../../shared/constants.js";
import { sendWsMsg } from '../utility.js';

export default function (data, ws) {
	const client = ws.client;

	// 如果已经在一个房间里就先从这个房间里移除
	if ( client.room )
		client.room.removePlayer(client);
	
	const room = roomManager.get(data.roomID);
	if ( !room )
		return;

	client.setUsername(data.username);
	
	const result = room.addClient(client);
	
	if ( result == 0 ) { // 成功加入
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.ROOM.JOIN, {
			result: result,
			room: room.getData(),
		});
		room.broadcast(
			Constants.MSG_TYPES.SERVER.ROOM.PLAYER_JOIN,
			{
				player: room.getPlayerData(client.uuid),
			},
			[client.uuid],
		)
	} else { // 加入失败
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.ROOM.JOIN, {
			result: result,
		});
	}
}