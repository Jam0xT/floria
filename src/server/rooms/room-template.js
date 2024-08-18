import Team from '../teams.js';
import Room from './room-static.js';

export default class Room_Template {
	id = Room.getNewRoomID();
	
	andomTeamColorSeed = Math.random(); // 随机颜色种子
	
	canPlayerJoinIfStarted;
	
	isGameStarted = false;
	
	players = {};
	
	teams = [];
	
	maxPlayerAmount = 0;
	
	constructor(teamSetting) {
		this.setTeamByArray(teamSetting);
	}
	
	//增加玩家，可能不成功
	tryAddPlayer(player) {
		//游戏开始且不允许中途加入游戏就阻止加入
		if (this.isGameStarted && !this.canPlayerJoinIfStarted) return `started`;
		
		//房间人满，不予加入
		if (this.maxPlayerAmount == Object.keys(this.players).length) return `full`;
		
		this.players[player.uuid] = player;
		player.room = this;
		player.gameState = `waiting`;
		console.log(`player added:` + player.uuid)
		return `success`;
	}
	
	removePlayer(player) {
		player.gameState = `idle`;
		player.room = undefined;
		delete this.players[player.uuid];
		
		if (Object.keys(this.players).length == 0) {
			Room.removeRoom(this);
		}
		console.log(`player removed:` + player.uuid)
	}
	
	//切换玩家准备状态
	playerSwitchReady(player) {
		//切换玩家游戏状态
		player.gameState = player.gameState == `waiting` ? `ready` : `waiting`;
		console.log(`player state:` + player.gameState)
		//是否有至少一位玩家没有准备，为undefind就是全部准备
		const isAtLeastOnePlayerNotReady = Object.values(this.players).find((player) => {
			return player.gameState == `waiting`;
		})
		
		//启动游戏所需最少玩家，k为常量, <= 1
		const k = 0.75;
		const playerAmountMinToStart = Math.floor(this.maxPlayerAmount * k);
		
		//当前玩家数
		const playerAmount = Object.keys(this.players).length;
		
		//^^^
		if (!isAtLeastOnePlayerNotReady && playerAmount >= playerAmountMinToStart) this.startGame();
	}
	
	//获取要发送到前端的数据
	getData() {
		const playerDatas = [];
		Object.values(this.players).forEach((player) => {
			playerDatas.push(player.getData());
		})
		
		return {
			id: this.id,
			playerDatas: playerDatas
		}
	}
	
	//使用数组设置team属性 示例：[2,2,2,2] 为4team，每team的人数为2人
	setTeamByArray(teamArray) {
		//reset
		this.teams = [];
		this.maxPlayerAmount = 0;
		
		for (let i = 0; i < teamArray.length; i++) {
			const teamSize = teamArray[i];
			this.maxPlayerAmount += teamSize;
			const newTeam = new Team(teamSize, i);
			this.teams.push(newTeam);
		}
	}
	
	getTeamById(teamId) {
		return this.teams[teamId];
	}
	
	//分配玩家队伍函数
	assignTeamsToPlayers() {}
	
	//开始游戏函数
	startGame() {};
}