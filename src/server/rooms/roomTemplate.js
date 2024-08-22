import Team from '../teams.js';
import * as roomManager from '../roomManager.js';
import { TeamPresets } from '../teams.js';
import log from '../log.js';

export default class Room_Template {
	id = roomManager.getNewRoomID();
	
	andomTeamColorSeed = Math.random(); // 随机颜色种子
	
	canPlayerJoinIfStarted;
	
	isGameStarted = false;
	
	players = {};
	
	teams = [];
	
	maxPlayerAmount = 0;
	
	isPrivate = true;
	
	constructor(settings) {
		this.setTeamByArray(settings.team);
	}
	
	//增加玩家，可能不成功
	tryAddPlayer(player) {
		const canAddPlayer = this.determineCanRoomAddPlayer();
		
		if (canAddPlayer.bool) {
			this.players[player.uuid] = player;
			player.room = this;
			player.gameState = `waiting`;
			console.log(`${log.gray('[')}${log.gray('#')}${log.blue(this.id)}${log.gray(']')} ${log.green('+')} ${log.gray(player.uuid)}`);
		}
		
		return canAddPlayer.reason;
	}
	
	determineCanRoomAddPlayer() {
		//游戏开始且不允许中途加入游戏就阻止加入
		if (this.isGameStarted && !this.canPlayerJoinIfStarted) return {
			bool: false,
			reason: `started`
		};
		
		//房间人满，不予加入
		if (this.maxPlayerAmount == Object.keys(this.players).length) return {
			bool: false,
			reason: `full`
		};
		
		return {
			bool: true,
			reason: `success`
		};
	}
	
	removePlayer(player) {
		player.gameState = `idle`;
		player.room = undefined;
		delete this.players[player.uuid];
		
		if (Object.keys(this.players).length == 0) {
			roomManager.removeRoom(this);
		}
		
		if (player == this.owner) {
			this.setOwner(Object.values(this.players)[0]);
		}
		
		console.log(`${log.gray('[')}${log.gray('#')}${log.blue(this.id)}${log.gray(']')} ${log.red('-')} ${log.gray(player.uuid)}`);
	}
	
	//切换玩家准备状态
	playerSwitchReady(player) {
		//切换玩家游戏状态
		player.gameState = player.gameState == `waiting` ? `ready` : `waiting`;
		console.log(`${log.gray('[')}${log.gray('#')}${log.blue(this.id)}${log.gray(']')} ${player.gameState == 'waiting' ? log.red('R') : log.green('R')} ${log.gray(player.uuid)}`);
		//是否有至少一位玩家没有准备，为undefind就是全部准备
		const isAtLeastOnePlayerNotReady = Object.values(this.players).find((player) => {
			return player.gameState == `waiting`;
		})
		
		//启动游戏所需最少玩家，k为常量, <= 1
		const k = 1;
		const playerAmountMinToStart = Math.floor(this.maxPlayerAmount * k);
		
		//当前玩家数
		const playerAmount = Object.keys(this.players).length;
		
		//^^^
		if (!isAtLeastOnePlayerNotReady && playerAmount >= playerAmountMinToStart)
			this.startGame();
	}
	
	updateSettings(settings) {
		if (this.isGameStarted) return;
		
		if ( settings.mapID ) {
			const mapSettings = roomManager.getMapSettings(this.type, settings.mapID);
			
			const teamSetting = TeamPresets.fair(mapSettings.teamCount, mapSettings.teamSize);
			
			this.setTeamByArray(teamSetting);
		}

		if ( settings.isPrivate ) {
			this.isPrivate = settings.isPrivate;
		}
	}
	
	setOwner(player) {
		this.owner = player
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
	
	getPlayerByUUID(uuid) {
		return this.players[uuid]
	}

	sendAll(data, excludedUUIDList) {
		Object.values(this.players).forEach(player => {
			if ( excludedUUIDList.includes(player.uuid) )
				return ;
			const ws = player.ws;
			ws.send(data);
		});
	}
	
	//分配玩家队伍函数
	assignTeamsToPlayers() {}
	
	//开始游戏函数
	startGame() {};
}