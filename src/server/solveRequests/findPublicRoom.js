import * as roomManager from "../roomManager.js";
import Constants from '../../shared/constants.js';
import { sendWsMsg } from '../utility.js';

export default function (data, ws) {
	const client = ws.client;

	const room = roomManager.findPublic();

	if ( room ) {
		const result = room.addClient(client.uuid);
		if ( result == 0 ) { // 成功加入
			client.setUsername(data.username);
	
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
	} else {
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.ROOM.JOIN, {
			result: 3,
		});
	}
}