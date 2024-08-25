class Team {
	playerCount = 0;
	
	id;

	size;
	
	players = {};
	
	constructor(id, size) {
		this.id = id;
		this.size = size;
	}
	
	addPlayer(player) {
		this.players[player.uuid] = player;
		player.team = this;
		this.playerCount ++;
	}
	
	removePlayer(player) {
		delete this.players[player.uuid];
		player.team = undefined;
		this.playerCount --;
	}
	
	clear() {
		this.players = {};
	}
}

export default Team;