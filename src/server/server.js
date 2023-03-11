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

const port = process.env.PORT || 2147;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

const io = socketio(server);

io.on('connection', socket => {
	console.log('Player connected! ID: ', socket.id);

	socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
	socket.on(Constants.MSG_TYPES.INPUT, handleInput);
	socket.on('disconnect', onDisconnect);
})

const game = new Game();

function joinGame(username) {
	console.log(`Player Joined Game with Username: ${username}`);
	game.addPlayer(this, username);
}

function handleInput(input) {
	game.handleInput(this, input);
}

function onDisconnect() {
	game.disconnectPlayer(this);
}