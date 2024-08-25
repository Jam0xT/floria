import Constants from "../../shared/constants.js";
import { sendWsMsg } from '../utility.js';

export default function (data, ws) {
	// 发送请求的客户端
	const client = ws.client;
	
	// 请求的房间
	const room = client.room;

	if ( !room ) {
		return ;
	}

	// 不是房主 不能修改设置
	if ( !room.players[client.uuid].isOwner ) {
		return ;
	}

	// 遍历所有修改项
	data.forEach(item => {
		const {key, value} = item;

		switch ( key ) {
			case 'isPrivate': {
				room.setPrivate(value);
				break;
			}
			case 'mapID': {
				room.setMap(value);
				break;
			}
			default:
				break;
		}
	});

	// 广播更新信息
	room.broadcast(
		Constants.MSG_TYPES.SERVER.ROOM.UPDATE_SETTINGS,
		data,
		[client.uuid],
	);
}