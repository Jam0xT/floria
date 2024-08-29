import * as roomManager from '../roomManager.js';

export default function (data, ws) {
	const client = ws.client;
	const room = client.room;

	if ( !room )
		return ;

	const game = room.game;

	if ( !game )
		return ;

	game.handlePlayerInput(client.uuid, data.type, data.value);
}