import * as roomManager from "../roomManager.js";
import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestJoinRoom(value, ws) {
	if (ws.player.room) ws.player.room.removePlayer(ws.player);
	
	const room = roomManager.getRoomById(value.roomID);
	if ( !room )
		return;

	ws.player.setUsername(value.username);
	
	const joinResult = room.tryAddPlayer(ws.player);
	
	//success
	if (joinResult == `success`) {
		const roomData = room.getData();
		const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN, { roomData: roomData });
		ws.send(data);
		return;
	}
	
	//failed
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN_REJECTED, { reason: joinResult })
	ws.send(data);
}