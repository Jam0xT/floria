import * as roomManager from "../roomManager.js";
import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestJoinRoom(value, ws) {
	const player = ws.player;
	if ( player.room )
		player.room.removePlayer(player);
	
	const room = roomManager.getRoomById(value.options.roomID);
	if ( !room )
		return;

	player.setUsername(value.options.username);
	
	const joinResult = room.tryAddPlayer(player);
	
	//success
	if (joinResult == `success`) {
		const roomData = room.getData();
		ws.send(createData(
			Constants.MSG_TYPES.SERVER.ROOM.JOIN,
			{
				roomData: roomData,
			}
		));

		room.sendAll(createData(
			Constants.MSG_TYPES.SERVER.ROOM.PLAYER_JOIN,
			{
				playerData: player.getData(),
			}
		), [player.uuid]);

		return;
	}
	
	//failed
	const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN_REJECTED, { reason: joinResult })
	ws.send(data);
}