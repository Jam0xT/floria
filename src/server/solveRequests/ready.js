import Constants from "../../shared/constants.js";

export default function (data, ws) {
	const client = ws.client;
	const room = client.room;
	
	if ( !room || room.isGameStarted ) {
		return ;
	}

	room.setReady(client, data.isReady);

	room.broadcast(
		Constants.MSG_TYPES.SERVER.ROOM.PLAYER_READY,
		{
			player: room.getPlayerData(client.uuid),
		},
		[client.uuid],
	);
}