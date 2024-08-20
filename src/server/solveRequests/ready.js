

export default function onPlayerRequestReady(value, ws) {
	const player = ws.player;
	
	if (!player.room || player.room.isGameStarted) return;
	
	player.room.playerSwitchReady(player);
}