import Room from "../rooms/room-static.js";

export default function onPlayerRequestFindPublicRoom(value, ws) {
	const room = Room.findPublic()
	if (room) {
		room.tryAddPlayer(ws.player);
	}
}