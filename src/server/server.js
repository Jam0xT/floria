import Constants from '../shared/constants.js';
import { WebSocketServer } from 'ws';
import Client from './client.js';
import * as wsMsgHandler from './wsMsgHandler.js';

class Server {
	wss;

	clients = {};

	constructor() {
		this.initWSS();
	}

	// 初始化 WebSocket 服务器
	initWSS() {
		// 读取 WebSocket 服务器端口
		const wsPort = Constants.WS_PORT;

		// 创建新的 WebSocketServer 实例
		this.wss = new WebSocketServer({
			port: wsPort,
		});

		const wss = this.wss;

		// 监听客户端连接事件
		wss.on('connection', (ws) => {
			ws.on('close', () => {
				// if (!ws.player) return;
				// Player.createDelayRemove(ws.player);
			});
			
			ws.on('error', () => {
				// if (!ws.player) return;
				// Player.createDelayRemove(ws.player);
			});

			// 处理客户端请求
			ws.on('message', (msg) => {
				this.handleWSMsg(ws, msg);
			});
		});
	}

	// 处理接收到的 ws 信息
	handleWSMsg(ws, msg) {
		// 读取 信息类型 和 信息数据
		const {type, data} = JSON.parse(msg);

		// 如果这个 ws 没有 client，则直接判定为连接请求
		if ( !ws.client ) {
			wsMsgHandler.connect(data, ws);
			return ;
		}

		switch ( type ) {
			// 连接
			case Constants.MSG_TYPES.CLIENT.CONNECT: {
				wsMsgHandler.connect(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.JOIN: {
				wsMsgHandler.joinRoom(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.CREATE: {
				wsMsgHandler.createRoom(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.LEAVE: {
				wsMsgHandler.leaveRoom(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.READY: {
				wsMsgHandler.ready(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.KICK_PLAYER: {
				wsMsgHandler.kickPlayer(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.UPDATE_SETTINGS: {
				wsMsgHandler.updateRoomSettings(data, ws);
				break;
			}

			case Constants.MSG_TYPES.CLIENT.ROOM.FIND_PUBLIC: {
				wsMsgHandler.findPublicRoom(data, ws);
				break;
			}

			default:
				break;
		}
	}

	// 重新连接
	reconnect(ws, uuid) {
		// no reconnecting for now
		return false;
	}
}

export default Server;