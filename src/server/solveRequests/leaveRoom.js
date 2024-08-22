import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestLeaveRoom(value, ws) {
	const player = ws.player;

	const room = player.room;
	
	if ( !room )
		return;
	
	room.removePlayer(player);

	room.sendAll(createData(
		Constants.MSG_TYPES.SERVER.ROOM.PLAYER_LEAVE,
		{
			playerData: player.getData(),
		}
	), [player.uuid]);
}