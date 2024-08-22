import * as roomManager from "../roomManager.js";

export default function onPlayerRequestFindPublicRoom(value, ws) {
	const room = roomManager.findPublic()
	if (room) {
		room.tryAddPlayer(ws.player);
		const roomData = room.getData();
		const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN, { roomData: roomData });
		ws.send(data);
		return;
	}
}