import Team from './team.js';
import * as roomManager from '../roomManager.js';
import { sendWsMsg } from '../utility.js';
import Player from './player.js'; 
import logger from '../logger.js';
import * as mapSet from '../gamemodes/mapSet.js';
import server from '../index.js';
import gamemodes from '../gamemodes/gamemodes.js';
import Constants from '../../shared/constants.js';

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

	game;

	isFull = false;
	
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
		if ( Object.keys(this.players).length >= this.maxPlayerCount ) {
			this.isFull = true;
		}
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
		if ( Object.keys(this.players).length < this.maxPlayerCount ) {
			this.isFull = false;
		}
		logger.room.removePlayer(this.id, uuid);
	}

	// 解决客户端对设置准备状态的请求
	setReady(client, isReady) {
		const uuid = client.uuid;
		const player = this.players[uuid];
		player.isReady = isReady;

		let readyPlayerCount = 0;
		Object.values(this.players).forEach(player => {
			readyPlayerCount += player.isReady ? 1 : 0;
		});

		// 满人且全都准备
		if ( readyPlayerCount == this.maxPlayerCount ) {
			this.startGame();
		}
	}
	
	setPrivate(isPrivate) {
		if ( this.isGameStarted ) {
			return ;
		}
		this.isPrivate = isPrivate;
	}

	setMap(mapID) {
		if ( this.isGameStarted ) {
			return ;
		}
		this.map = mapSet[this.gamemode][mapID];
		this.maxPlayerCount = this.map.teamCount * this.map.teamSize;
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
	
	// //使用数组设置team属性 示例：[2,2,2,2] 为4team，每team的人数为2人
	// setTeamByArray(teamArray) {
	// 	//reset
	// 	this.teams = [];
	// 	this.maxPlayerAmount = 0;
		
	// 	for (let i = 0; i < teamArray.length; i++) {
	// 		const teamSize = teamArray[i];
	// 		this.maxPlayerAmount += teamSize;
	// 		const newTeam = new Team(teamSize, i);
	// 		this.teams.push(newTeam);
	// 	}
	// }
	
	// getTeamById(teamId) {
	// 	return this.teams[teamId];
	// }
	
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
	assignTeams() {
		this.teams = [];
		for (let i = 0; i < this.map.teamCount; i ++ ) {
			const team = new Team(i, this.map.teamSize);
			this.teams.push(team);
		}

		Object.values(this.players).forEach((player) => {
			if ( player.team )
				return;
			
			//获取所有队伍中目前人数最少的队伍
			const teamPlayerCountMin = Math.min(...this.teams.map((team) => team.playerCount));
			const team = this.teams.find((team) => team.playerCount == teamPlayerCountMin);
			team.addPlayer(player);
		});
		
		// console.log(this.teams);
	}
	
	//开始游戏函数
	startGame() {
		console.log('game start');
		
		const game = new gamemodes[this.gamemode]();
		this.game = game;

		game.setMap(this.map.id);

		this.assignTeams();

		const teamColors = this.teams.map(team => team.color);

		this.broadcast(
			Constants.MSG_TYPES.SERVER.ROOM.START,
			{
				teamColors: teamColors,
			},
			[],
		);

		Object.values(this.players).forEach(player => {
			this.game.addPlayer(player);
		});

		this.game.start();

		this.isGameStarted = true;
	}
}

export default Room;