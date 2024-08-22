import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestReady(value, ws) {
	const player = ws.player;

	const room = player.room;
	
	if (!room || room.isGameStarted) return;
	
	room.playerSwitchReady(player);

	room.sendAll(createData(
		Constants.MSG_TYPES.SERVER.ROOM.PLAYER_READY,
		{
			playerData: player.getData(),
		}
	), [player.uuid]);
}