import Constants from "../../shared/constants.js";

export default function (data, ws) {
	const client = ws.client;
	const room = client.room;

	// 房间不存在 / 不在一个房间中
	if ( !room ) {
		return ;
	}

	room.broadcast(
		Constants.MSG_TYPES.SERVER.ROOM.PLAYER_LEAVE,
		{
			player: room.getPlayerData(client.uuid),
		},
		[client.uuid],
	);

	room.removeClient(client.uuid);
}