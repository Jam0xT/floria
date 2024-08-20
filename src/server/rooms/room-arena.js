import Room_Template from "./room-template.js";
import Game_Arena from '../gamemodes/arena/arena.js';

export default class Room_Arena extends Room_Template {
	canPlayerJoinIfStarted = false;
	
	constructor(settings) {
		super(settings);
		this.type = `arena`;
	}
	
	//分配队伍
	assignTeamsToPlayers() {

		
		Object.values(this.players).forEach((player) => {
			if (player.team) return;
			
			//获取所有队伍中目前人数最少的队伍
			const teamPlayerCountMin = Math.min(...this.teams.map((team) => team.playerCount));
			const team = this.teams.find((team) => team.playerCount == teamPlayerCountMin);
			team.addPlayer(player);
		})

		
		console.log(this.teams)
	}
	
	startGame() {
		this.assignTeamsToPlayers()
		
		const game = new Game_Arena();
		
		Object.values(this.players).forEach((player) => {
			player.gameState = `inGame`;
			player.game = game;
		})
		this.isGameStarted = true;
		
		console.log(`nerd started`)
	}
}