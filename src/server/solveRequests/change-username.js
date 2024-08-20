

export default function onPlayerRequestChangeUsername(value, ws) {
	ws.player.setUserName(value.self.username)
}