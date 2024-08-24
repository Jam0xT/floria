import * as roomManager from "../roomManager.js";
import Constants from '../../shared/constants.js';
import { sendWsMsg } from '../utility.js';

export default function (data, ws) {
	// 创建新房间
	const newRoom = roomManager.createRoom(data.gamemode);

	const client = ws.client;

	client.setUsername(data.username);

	// 在新建房间中添加客户端
	const result = newRoom.addClient(client);
	
	if ( result == 0 ) { // 加入成功
		newRoom.setOwner(client);
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.ROOM.JOIN, {
			result: result,
			room: newRoom.getData(),
		});
	} else { // 加入失败
		console.log('join room after creating failed');
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.ROOM.JOIN, {
			result: result,
		});
	}
}