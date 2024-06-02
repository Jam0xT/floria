const players = {};

export {
	add,
};

function add(socket) {
	players[socket.id] = socket;
}