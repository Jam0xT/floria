const express = require("express");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require("../../webpack.dev.js");

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

const io = socketio(server);

io.on('connection', socket => {
	console.log('Player connected! ID: ', socket.id);

	socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	socket.on(Constants.MSG_TYPES.MOVEMENT, handleMovement);
	socket.on(Constants.MSG_TYPES.MOUSE_DOWN, handleMouseDown);
	socket.on(Constants.MSG_TYPES.MOUSE_UP, handleMouseUp);
	socket.on(Constants.MSG_TYPES.PETAL_SWITCH, handlePetalSwitch);
	socket.on(Constants.MSG_TYPES.PETAL_DISABLE, handlePetalDisable);
	socket.on('disconnect', onDisconnect);
});

const game = new Game();

function joinGame(username) {
	if ( username.length <= 20 ) {
		console.log(`Player Joined Game with Username: ${username}`);
		game.addPlayer(this, username);
	}
}

function handleMovement(movement) {
	game.handleMovement(this, movement);
}

function handleMouseDown(mouseDownEvent) {
	game.handleMouseDown(this, mouseDownEvent);
}

function handleMouseUp(mouseUpEvent) {
	game.handleMouseUp(this, mouseUpEvent);
}

function handlePetalSwitch(petalA, petalB, implement) {
	game.handlePetalSwitch(this, petalA, petalB, implement);
}

function handlePetalDisable(petal) {
	game.handlePetalDisable(this, petal);
}

function onDisconnect() {
	game.onPlayerDisconnect(this);
}