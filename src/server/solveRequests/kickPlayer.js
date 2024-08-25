import Constants from '../../shared/constants.js';
import { sendWsMsg } from '../utility.js';
import server from '../index.js';

export default function (data, ws) {
	// 发送请求的客户端
	const client = ws.client;

	// 请求的房间
	const room = client.room;

	if ( !room ) {
		return ;
	}

	// 不是房主 不能踢人
	if ( !room.players[client.uuid].isOwner ) {
		return ;
	}

	// 房主不能踢自己
	if ( client.uuid == data.uuid ) {
		return ;
	}

	// 给被踢的客户端之外的客户端发送玩家离开信息
	room.broadcast(
		Constants.MSG_TYPES.SERVER.ROOM.PLAYER_LEAVE,
		{
			player: room.getPlayerData(data.uuid),
		},
		[data.uuid],
	);

	// 告诉被踢的客户端他被踢了
	sendWsMsg(
		server.clients[data.uuid].ws,
		Constants.MSG_TYPES.SERVER.ROOM.LEAVE,
		{},
	);

	// 从房间中移除被踢的客户端
	room.removeClient(data.uuid);
}