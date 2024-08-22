export default Object.freeze({
	WS_PORT: 25563,
	MSG_TYPES: {
		CLIENT: {
			PLAYER:{
				CONNECT: 'client_player_connect',
				CHANGE_USERNAME: 'client_player_change_username',
				FIND_PUBLIC_ROOM: 'client_player_find_public_room',
			},
			ROOM: {
				CREATE: 'client_room_create',
				JOIN: 'client_room_join',
				LEAVE: 'client_room_leave',
				READY: 'client_room_ready',
				UPDATE_SETTINGS: 'client_room_update_settings',
				KICK_PLAYER: 'client_room_kick_player',
				INFO: 'client_room_info',
				SETTINGS: 'client_room_settings',
				CHANGE_TEAM: 'client_room_change_team',
				MAP_UPDATE: 'client_room_map_update',
			},
			GAME: {
				INPUT: 'client_game_input',
			}
		},
		SERVER: {
			CONNECT: 'server_connect',
			ROOM: {
				CREATE: 'server_room_create',
				JOIN: 'server_room_join',
				LEAVE: 'server_room_leave',
				PLAYER_JOIN: 'server_room_player_join',
				PLAYER_LEAVE: 'server_room_player_leave',
				PLAYER_READY: 'server_room_player_ready',
				UPDATE_SETTINGS: 'server_room_update_settings',
				UPDATE: 'server_room_update',
				INFO: 'server_room_info',
				SETTINGS: 'server_room_settings',
				READY: 'server_room_ready',
				START: 'server_room_start',
				JOIN_REJECTED: 'server_room_join_rejected',
			},
			GAME: {
				INIT: 'server_game_init',
				START: 'server_game_start',
				OVER: 'server_game_over',
				UPDATE: 'server_game_update',
			}
		},
	},
});