import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestReady(value, ws) {
	const player = ws.player;

	const room = player.room;
	
	if (!room || room.isGameStarted) return;
	
	room.playerSwitchReady(player);

	const roomData = room.getData();
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
	ws.send(data);
}