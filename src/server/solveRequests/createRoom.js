import * as roomManager from "../roomManager.js";
import { createData } from "../server.js";
import Constants from '../../shared/constants.js';

export default function onPlayerRequestCreateRoom(value, ws) {
	//创建房间，添加玩家进入房间
	const newRoom = roomManager.createRoom(value.options);
	ws.player.setUsername(value.options.username);
	newRoom.tryAddPlayer(ws.player);
	newRoom.setOwner(ws.player);
	
	//返回房间数据
	const roomData = newRoom.getData();
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN, { roomData: roomData });
	ws.send(data);
}