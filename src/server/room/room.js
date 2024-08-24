import Team from '../teams.js';
import * as roomManager from '../roomManager.js';
import { TeamPresets } from '../teams.js';
import { sendWsMsg } from '../utility.js';
import Player from './player.js'; 
import logger from '../logger.js';
import * as mapSet from '../gamemodes/mapSet.js';
import server from '../index.js';

class Room {
	id = roomManager.getNewRoomID();
	
	randomTeamColorSeed = Math.random(); // 随机颜色种子
	
	canPlayerJoinIfStarted;
	
	isGameStarted = false;
	
	players = {};
	
	teams = [];
	
	maxPlayerCount;
	
	isPrivate = true;

	ownerUUID;

	gamemode;

	map;
	
	constructor(gamemode) {
		this.gamemode = gamemode;
		this.map = Object.values(mapSet[gamemode])[0];
		this.maxPlayerCount = this.map.teamCount * this.map.teamSize;
	}
	
	// 将一个客户端加入房间
	addClient(uuid) {
		const client = server.clients[uuid];
		if ( this.isGameStarted && !this.canPlayerJoinIfStarted ) {
			// 游戏开始且不允许加入
			return 1;
		}

		if ( this.maxPlayerCount == Object.keys(this.players).length ) {
			// 满人
			return 2;
		}

		// 成功加入
		this.players[uuid] = new Player(client);
		client.setRoom(this);
		logger.room.addPlayer(this.id, uuid);
		return 0;
	}
	
	// 移除一个客户端
	removeClient(uuid) {
		const client = server.clients[uuid];
		client.room = '';
		delete this.players[uuid];

		// 最后一个人离开房间 移除该房间
		if ( Object.keys(this.players).length == 0 ) {
			roomManager.remove(this);
		} else {
			// 离开的人是 owner 且房间里还有人
			if ( uuid == this.ownerUUID ) {
				// 设置新的 owner
				this.setOwner(Object.values(this.players)[0].client);
			}
		}
		logger.room.removePlayer(this.id, uuid);
	}

	// 解决客户端对设置准备状态的请求
	setReady(client, isReady) {
		const uuid = client.uuid;
		const player = this.players[uuid];
		player.isReady = isReady;
	}
	
	// //切换玩家准备状态
	// playerSwitchReady(player) {
	// 	//切换玩家游戏状态
	// 	player.gameState = player.gameState == `waiting` ? `ready` : `waiting`;
	// 	console.log(`${log.gray('[')}${log.gray('#')}${log.blue(this.id)}${log.gray(']')} ${player.gameState == 'waiting' ? log.red('R') : log.green('R')} ${log.gray(player.uuid)}`);
	// 	//是否有至少一位玩家没有准备，为undefind就是全部准备
	// 	const isAtLeastOnePlayerNotReady = Object.values(this.players).find((player) => {
	// 		return player.gameState == `waiting`;
	// 	})
		
	// 	//启动游戏所需最少玩家，k为常量, <= 1
	// 	const k = 1;
	// 	const playerAmountMinToStart = Math.floor(this.maxPlayerAmount * k);
		
	// 	//当前玩家数
	// 	const playerAmount = Object.keys(this.players).length;
		
	// 	//^^^
	// 	if (!isAtLeastOnePlayerNotReady && playerAmount >= playerAmountMinToStart)
	// 		this.startGame();
	// }
	
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
	
	setOwner(client) { // 添加 player 有一样的效果，因为 player.uuid 来自于其连接的 client
		this.ownerUUID = client.uuid;
		this.players[client.uuid].isOwner = true;
	}
	
	// 获取要发送到客户端的数据
	getData() {
		const players = [];
		Object.values(this.players).forEach((player) => {
			players.push(player.getData());
		});
		
		return {
			id: this.id,
			ownerUUID: this.ownerUUID,
			players: players,
		}
	}

	getPlayerData(uuid) {
		return this.players[uuid].getData();
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

	broadcast(type, data, excludedUUIDList) {
		Object.values(this.players).forEach(player => {
			if ( excludedUUIDList.includes(player.uuid) )
				return ;
			sendWsMsg(player.client.ws, type, data);
		});
	}
	
	//分配玩家队伍函数
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
	
	//开始游戏函数
	startGame() {
		this.assignTeamsToPlayers()
		
		console.log(`nerd started`)
		
		const game = new Game_Arena();
		
		Object.values(this.players).forEach((player) => {
			player.gameState = `inGame`;
			player.game = game;
		})
		this.isGameStarted = true;
	}
}

export default Room;