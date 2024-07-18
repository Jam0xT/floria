import express from "express";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import { Server } from 'socket.io';

import Constants from '../shared/constants.js';
import webpackConfig from "../../webpack.dev.js";

import * as room from './room.js';
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV == "development") {
	const compiler = webpack(webpackConfig);
	app.use(webpackDevMiddleware(compiler));
} else {
	app.use(express.static('dist'));
}

const port = process.env.PORT || 25565;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

const io = new Server(server);

io.on('connection', socket => {
	console.log(`Player ${socket.id} connected.`);
	socket.on(Constants.MSG_TYPES.CLIENT.ROOM.CREATE, createRoom);
	socket.on(Constants.MSG_TYPES.CLIENT.ROOM.JOIN, joinRoom);
	socket.on(Constants.MSG_TYPES.CLIENT.ROOM.SETTINGS, updSettings);
	// socket.on(Constants.MSG_TYPES.CLIENT.ROOM.GETROOM, getRoomOfPlayer);
	// socket.on(Constants.MSG_TYPES.CLIENT.ROOM.CHECKOWNER, checkOwner);
	// socket.on(Constants.MSG_TYPES.CLIENT.ROOM.READY, readyChange);
	socket.on(Constants.MSG_TYPES.CLIENT.ROOM.LEAVE, leaveRoom);
	socket.on('disconnect', onDisconnect);
	// socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	// socket.on(Constants.MSG_TYPES.MOVEMENT, handleMovement);
	// socket.on(Constants.MSG_TYPES.MOUSE_DOWN, handleMouseDown);
	// socket.on(Constants.MSG_TYPES.MOUSE_UP, handleMouseUp);
	// socket.on(Constants.MSG_TYPES.PETAL_SWITCH, handlePetalSwitch);
	// socket.on(Constants.MSG_TYPES.CMD_INV, handleCmdInv)
	// socket.on('disconnect', onDisconnect);
});

function createRoom(mode, username) {
	room.createRoom(this, mode, username);
}

function joinRoom(mode, username, roomId) {
	room.joinRoom(this, mode, username, roomId);
}

function updSettings(type, update) {
	room.updSettings(this, type, update);
}

function getRoomOfPlayer() {
	room.getRoomOfPlayer(this);
}
function checkOwner() {
	room.checkOwner(this);
}

function readyChange() {
	room.roomOfPlayers[this.id].readyChange(this);
}

function leaveRoom() {
	room.leaveRoom(this);
}

function onDisconnect() {
	room.disconnect(this);
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