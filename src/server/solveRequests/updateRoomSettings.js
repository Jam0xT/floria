

export default function onPlayerRequestUpdateRoomSettings(value, ws) {
	if (!ws.player.room) return;
	
	ws.player.room.updateSettings({
		map: value.room.map,
		isPrivate: value.room.isPrivate
	})
}