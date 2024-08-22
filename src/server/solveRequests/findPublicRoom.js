import Room from "../rooms/roomStatic.js";

export default function onPlayerRequestFindPublicRoom(value, ws) {
	const room = Room.findPublic()
	if (room) {
		room.tryAddPlayer(ws.player);
		const roomData = room.getData();
		const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
		ws.send(data);
		return;
	}
	
}