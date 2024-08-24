import server from '../index.js';
import Client from "../client.js";
import { sendWsMsg } from '../utility.js';
import Constants from "../../shared/constants.js";

export default function (data, ws) {
	// 获取 uuid
	const uuid = data.uuid;

	if ( uuid ) { // 可能是断开连接的客户端，尝试重连
		if ( server.reconnect(ws, uuid) ) {
			// 重连成功
		} else {
			// 重连失败
		}
	} else { // 新的客户端
		// 创建新的 Client 实例
		const client = new Client(ws);

		// 发送客户端 uuid
		sendWsMsg(ws, Constants.MSG_TYPES.SERVER.CONNECT, {
			uuid: client.uuid,
		});
	}
}