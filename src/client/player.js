import * as nw from "./networking"

export default class Player {
	static setUsername(userName) {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.CHANGE_USERNAME, {
			self: {
				username: userName
			}
		})
		nw.ws.send(data)
	}
	
	static findPublicRoom() {
		const data = nw.createData(Constants.MSG_TYPES.CLIENT.PLAYER.FIND_PUBLIC_ROOM, { })
		nw.ws.send(data)
	}
}