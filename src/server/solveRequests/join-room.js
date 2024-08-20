import Room from "../rooms/room-static.js";
import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestJoinRoom(value, ws) {
	if (ws.player.room) ws.player.room.removePlayer(ws.player);
	
	const room = Room.getRoomById(value.room.id);
	if (!room) return;
	
	const joinResult = room.tryAddPlayer(ws.player);
	
	//success
	if (joinResult == `success`) {
		const roomData = room.getData();
		const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
		ws.send(data);
		return;
	}
	
	//failed
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN_REJECTED, { reason: joinResult })
	ws.send(data);
}