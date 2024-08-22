

export default function onPlayerRequestKickPlayer(value, ws) {
	if (!ws.player.room) return;
	
	if (ws.player.room.owner != ws.player) return;
	
	const player = ws.player.room.getPlayerByUUID(value.player.uuid);
	ws.player.room.removePlayer(player);
}