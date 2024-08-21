import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import { WebSocketServer } from 'ws';

import Constants from '../shared/constants.js';
import webpackConfigDev from "../../webpack.dev.js";
import webpackConfigProd from '../../webpack.prod.js';

import Room from './rooms/room-static.js';
import Player from "./server-player.js";
import onPlayerConnect from "./solveRequests/connect.js";
import onPlayerRequestCreateRoom from "./solveRequests/create-room.js";
import onPlayerRequestJoinRoom from "./solveRequests/join-room.js";
import onPlayerRequestLeaveRoom from "./solveRequests/leave-room.js";
import onPlayerRequestReady from "./solveRequests/ready.js";
import onPlayerRequestChangeTeam from "./solveRequests/change-team.js";
import onPlayerRequestChangeUsername from "./solveRequests/change-username.js";
import onPlayerRequestUpdateRoomSettings from "./solveRequests/update-room-settings.js";
import onPlayerRequestKickPlayer from "./solveRequests/kick-player.js";
import onPlayerRequestFindPublicRoom from "./solveRequests/find-public-room.js";

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

const wsPort = Constants.WS_PORT;

const wss = new WebSocketServer({
	port: wsPort,
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
		case Constants.MSG_TYPES.CLIENT.PLAYER.CONNECT: {
			onPlayerConnect(value, ws);
			break;
		}
		
		//客户端请求创建房间
		case Constants.MSG_TYPES.CLIENT.ROOM.CREATE: {
			onPlayerRequestCreateRoom(value, ws);
			break;
		}
			
		//客户端要求加入房间
		case Constants.MSG_TYPES.CLIENT.ROOM.JOIN: {
			onPlayerRequestJoinRoom(value, ws);
			break;
		}
		
		//离开房间
		case Constants.MSG_TYPES.CLIENT.ROOM.LEAVE: {
			onPlayerRequestLeaveRoom(value, ws);
			break;
		}
		
		//玩家准备
		case Constants.MSG_TYPES.CLIENT.ROOM.READY: {
			onPlayerRequestReady(value, ws);
		}
		
		//切换队伍
		case Constants.MSG_TYPES.CLIENT.ROOM.CHANGE_TEAM: {
			onPlayerRequestChangeTeam(value, ws);
			break;
		}
		
		case Constants.MSG_TYPES.CLIENT.PLAYER.CHANGE_USERNAME: {
			onPlayerRequestChangeUsername(value, ws);
			break;
		}
		
		case Constants.MSG_TYPES.CLIENT.ROOM.UPDATE_SETTINGS: {
			onPlayerRequestUpdateRoomSettings(value, ws);
			break;
		}
		
		case Constants.MSG_TYPES.CLIENT.ROOM.KICK_PLAYER: {
			onPlayerRequestKickPlayer(value, ws);
			break;
		}
		
		case Constants.MSG_TYPES.CLIENT.PLAYER.FIND_PUBLIC_ROOM: {
			onPlayerRequestFindPublicRoom(value, ws);
			break;
		}
			
		default:
			break;
	}
}

export function createData(request, value) {
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