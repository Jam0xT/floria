export const TeamPresets = {
	fair: function(teamAmount, teamSize) {
		return new Array(teamAmount).fill(teamSize);
	}
}

export default class Team {
	playerCount = 0;
	
	maxPlayerSize = Infinity;
	
	id = 0;
	
	players = {};
	
	constructor(maxPlayerSize, teamId) {
		this.maxPlayerSize = maxPlayerSize;
		this.id = teamId
	}
	
	addPlayer(player) {
		this.players[player.uuid] = player;
		player.team = this;
		this.playerCount ++;
	}
	
	removePlayer(player) {
		delete this.players[player.uuid];
		player.team = undefined;
		this.playerCount -- 
	}
	
	removeAllPlayers() {
		this.players = {};
	}
}