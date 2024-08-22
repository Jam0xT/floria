import Room from "../rooms/roomStatic.js";
import { createData } from "../server.js";
import Constants from '../../shared/constants.js';

export default function onPlayerRequestCreateRoom(value, ws) {
	//创建房间，添加玩家进入房间
	const newRoom = Room.createRoom(value.room.type, value.room.map, value.room.isPrivate);
	ws.player.setUsername(value.self.username);
	newRoom.tryAddPlayer(ws.player);
	newRoom.setOwner(ws.player)
	
	//返回房间数据
	const roomData = newRoom.getData();
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
	ws.send(data);
}