

export default function onPlayerRequestLeaveRoom(value, ws) {
	const player = ws.player;
	
	if (!player.room) return;
	
	player.room.removePlayer(player);
}