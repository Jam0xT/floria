import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import { WebSocketServer } from 'ws';

import Constants from '../shared/constants.js';
import webpackConfigDev from "../../webpack.dev.js";
import webpackConfigProd from '../../webpack.prod.js';

import Room from './rooms/room-static.js';
import Player from "./server-player.js";

const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV == "development") {
	const compiler = webpack(webpackConfigDev);
	app.use(webpackDevMiddleware(compiler));
} else if (process.env.NODE_ENV == "production") {
	const compiler = webpack(webpackConfigProd);
	app.use(webpackDevMiddleware(compiler));
} else {
	app.use(express.static('dist'));
}

const port = process.env.PORT || 25564;
app.listen(port);
console.log(`Server listening on port ${port}`);

const wss = new WebSocketServer({
	port: 25563,
});

wss.on('connection', (ws) => {
	ws.on('close', () => {
		if (!ws.player) return;
		Player.createDelayRemove(ws.player);
	})
	
	ws.on('error', () => {
		if (!ws.player) return;
		Player.createDelayRemove(ws.player);
	});

	ws.on('message', (text) => {
		solveRequestFromClient(ws, text);
		console.log(`received ${text}`);
	});
});

//解决客户端发来的请求
function solveRequestFromClient(ws, text) {
	const originalData = JSON.parse(text);
	const request = originalData.request;
	const value = originalData.value;
	
	if (!ws.player && request != Constants.MSG_TYPES.CLIENT.PLAYER.CONNECT) return;
	
	switch (request) {
		//客户端请求连接玩家，有就连接（reconnect）没有就创建
		case Constants.MSG_TYPES.CLIENT.PLAYER.CONNECT: 
			const uuid = value.self.uuid
			const isReconnectionSuccess = Player.tryReconnect(ws, uuid);
			
			if (isReconnectionSuccess) {
				Player.removeDelayRemove(ws.player);
				return
			} 
			
			//为新连接，创建玩家
			//判断用户名是否可用
			const isUsernameAvailable = Player.getUsernameUsability(value.self.username);
			if (!isUsernameAvailable) {
				ws.close()
				return;
			}
			
			Player.createNewPlayer(ws, value.self.username);
			break;
		
		//客户端请求创建房间
		case Constants.MSG_TYPES.CLIENT.ROOM.CREATE: {
			//创建房间，添加玩家进入房间
			const newRoom = Room.createRoom(value.room.type);
			newRoom.tryAddPlayer(ws.player)
			
			//返回房间数据
			const roomData = newRoom.getData();
			const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
			ws.send(data);
			break;
		}
			
		//客户端要求加入房间
		case Constants.MSG_TYPES.CLIENT.ROOM.JOIN: {
			if (ws.player.room) ws.player.room.removePlayer(ws.player);
			
			const room = Room.getRoomById(value.room.id);
			if (!room) return;
			
			const joinResult = room.tryAddPlayer(ws.player);
			
			//success
			if (joinResult == `success`) {
				const roomData = room.getData();
				const data = createData(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, { roomData: roomData });
				ws.send(data);
				return;
			}
			
			//failed
			const data = createData(Constants.MSG_TYPES.SERVER.ROOM.JOIN_REJECTED, { reason: joinResult })
			ws.send(data);
			return;
		}
		
		//离开房间
		case Constants.MSG_TYPES.CLIENT.ROOM.LEAVE: {
			const player = ws.player;
			
			if (!player.room) return;
			
			player.room.removePlayer(player);
			break;
		}
		
		//玩家准备
		case Constants.MSG_TYPES.CLIENT.ROOM.READY: {
			const player = ws.player;
			
			if (!player.room || player.room.isGameStarted) return;
			
			player.room.playerSwitchReady(player);
			break;
		}
		
		//切换队伍
		case Constants.MSG_TYPES.CLIENT.ROOM.CHANGE_TEAM: {
			const player = ws.player;
			
			if (!player.room) return;
			
			//将玩家移出目前所在队伍
			if (player.team) player.team.removePlayer(player);
			
			const newTeam = player.room.getTeamById(value.room.team.id);
			
			if (newTeam) newTeam.addPlayer(player);
			
			break;
		}
			
		default:
			break;
	}
}

function createData(request, value) {
	const data = {
		request: request,
		value: value
	}
	return JSON.stringify(data);
}
// function onDisconnect() {
// 	room.quitRoom(this, false);
// }
// const game = new Game();

// function joinGame(username) {
// 	if ( username.length <= 20 ) {
// 		console.log(`Player Joined Game with Username: ${username}`);
// 		game.addPlayer(this, username);
// 	}
// }

// function onDisconnect() {
// 	game.onPlayerDisconnect(this);
// }

// function handleMovement(movement) {
// 	game.handleMovement(this, movement);
// }

// function handleMouseDown(mouseDownEvent) {
// 	game.handleMouseDown(this, mouseDownEvent);
// }

// function handleMouseUp(mouseUpEvent) {
// 	game.handleMouseUp(this, mouseUpEvent);
// }

// function handlePetalSwitch(petalA, petalB, implement) {
// 	game.handlePetalSwitch(this, petalA, petalB, implement);
// }

// function handleCmdInv(sel, petal) {
// 	game.cmdInv(sel, petal);
// }

// merge test