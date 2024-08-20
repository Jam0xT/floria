

export default function onPlayerRequestChangeTeam(value, ws) {
	const player = ws.player;
	
	if (!player.room) return;
	
	//将玩家移出目前所在队伍
	if (player.team) player.team.removePlayer(player);
	
	const newTeam = player.room.getTeamById(value.room.team.id);
	
	if (newTeam) newTeam.addPlayer(player);
}