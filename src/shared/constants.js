export default Object.freeze({
	TICK_PER_SECOND: 25, // server runs X updates per second

	SPEED_ATTENUATION_COEFFICIENT: 0.7, // velocity *= X every tick

	MSG_TYPES: { // socket.io 交流
		CLIENT: {
			ROOM: {
				CREATE: 'client_room_create',
				JOIN: 'client_room_join',
				GETROOM: 'client_room_getroom',
				CHECKOWNER: 'client_room_CHECKOWNER',
			}
		},
		SERVER: {
			ROOM: {
				CREATE: 'server_room_create',
				UNSUCCESSFUL_JOIN: 'server_room_Unsuccessful-join',
				JOIN: 'server_room_join',
				GETROOM: 'server_room_getroom',
				CHECKOWNER: 'server_room_CHECKOWNER',
			}
		}
		// JOIN_GAME: 'join_game',
		// GAME_UPDATE: 'update',
		// MOVEMENT: 'movement',
		// MOUSE_DOWN: 'mouse_down',
		// MOUSE_UP: 'mouse_up',
		// GAME_OVER: 'dead',
		// PETAL_SWITCH: 'petal_switch',
		// LIGHTNING_PATH: 'lightning_path',
		// CMD_INV: 'cmd_inv',
	},

	MAP_WIDTH: 20000, // width of the map
	MAP_HEIGHT: 4000, // height of the map
	MAP_AREAS: {
		GARDEN: {
			START_WIDTH: 0,
			START_HEIGHT: 0,
			WIDTH: 4000,
			HEIGHT: 4000,
			MAX_LEVEL: 15,
			MAX_VOLUME: 4000,
			MOB_SPAWN_INTERVAL: 10,
			BACKGROUND_COLOR: `rgb(30, 167, 97)`,
			BACKGROUND_COLOR_DARKEN: `rgb(28, 154, 89)`,
		},
		DESERT: {
			START_WIDTH: 4000,
			START_HEIGHT: 0,
			WIDTH: 4000,
			HEIGHT: 4000,
			MAX_LEVEL: 30,
			MAX_VOLUME: 4000,
			MOB_SPAWN_INTERVAL: 10,
			BACKGROUND_COLOR: `rgb(222,207,124)`,
			BACKGROUND_COLOR_DARKEN: `rgb(199,186,111)`,
		},
		OCEAN: {
			START_WIDTH: 8000,
			START_HEIGHT: 0,
			WIDTH: 4000,
			HEIGHT: 4000,
			MAX_LEVEL: 45,
			MAX_VOLUME: 5000,
			MOB_SPAWN_INTERVAL: 10,
			BACKGROUND_COLOR: `rgb(85, 170, 255)`,
			BACKGROUND_COLOR_DARKEN: `rgb(69, 140, 211)`,
		},
		JUNGLE: {
			START_WIDTH: 12000,
			START_HEIGHT: 0,
			WIDTH: 4000,
			HEIGHT: 4000,
			MAX_LEVEL: 60,
			MAX_VOLUME: 7000,
			MOB_SPAWN_INTERVAL: 10,
			BACKGROUND_COLOR: `rgb(85, 170, 0)`,
			BACKGROUND_COLOR_DARKEN: `rgb(65, 130, 0)`,
		},
		UNKNOWN: {
			START_WIDTH: 16000,
			START_HEIGHT: 0,
			WIDTH: 4000,
			HEIGHT: 4000,
			MAX_LEVEL: Infinity,
			MAX_VOLUME: 10000,
			MOB_SPAWN_INTERVAL: 2,
			BACKGROUND_COLOR: `rgb(92, 92, 92)`,
			BACKGROUND_COLOR_DARKEN: `rgb(69, 69, 69)`,
		}
	},
	BLOCK_WIDTH: 200, // width of the block
	BLOCK_HEIGHT: 200, // height of the block

	RENDER_DELAY: 150, // render delay to make the animation smooth

	RATED_WIDTH: 1920, // rated rendering size on client
	RATED_HEIGHT: 1080,

	NEARBY_DISTANCE: 2500, // an entity will not be loaded on the client if its distance from the player >= X

	LEADERBOARD_LENGTH: 10, // the leaderboard will display you and the top X players

	MOB_VOLUME_LIMIT: 10000, // mobs won't spawn if the sum of volumes of all mobs alive >= X
	MOB_SPAWN_INTERVAL: 10, // try to spawn mobs every X ticks
	MOB_ATTACK_RADIUS: 800, //追踪范围以及友军mob最大远离玩家距离
	MOB_IDLE_RADIUS: 200, //友军mob待机范围
	MOB_IDLE_MOVEMENT_COOLDOWN: 4, //mob待机变向时间（s）

	CHUNK_SIZE: 200, // the size of each chunk
	CHUNK_ID_CONSTANT: 114514, // help get the id of each chunk

	SCORE_LOOTING_COEFFICIENT: 0.5, // your score will increase by X*S when you kill a player whose score is S
	EXP_LOOTING_COEFFICIENT: 0.2, // your exp will increase by X*E when you kill a player whose exp is E

	PETAL_ROTATION_SPEED_BASE: 2.5, // default player petal rotation speed
	PETAL_FLOAT_SPEED: 1, //翅膀上下摆动的速度

	PRIMARY_SLOT_COUNT_BASE: 5, // default player slot count
	SECONDARY_SLOT_COUNT_BASE: 5,

	PENETRATION_DEPTH_WEIGHT_IN_COLLISION: 1, // decides how much penetration depth will effect collision knockback
	// VELOCITY_WEIGHT_IN_COLLISION: 2, // decides how much velocity will effect collision knockback

	BASE_KNOCKBACK: 500, // base knockback when colliding

	PETAL_EXPAND_RADIUS_NORMAL: 45, // petal expand radius
	PETAL_EXPAND_RADIUS_ATTACK: 90,
	PETAL_EXPAND_RADIUS_DEFEND: 15,

	BUBBLE_ATTENUATION_COEFFICIENT: 0.8, // bubble velocity *= X every tick

	FIRST_PETAL_ID: 100,
	PETAL_MULTIPLE_MAX: 5, //多子花瓣最多拥有的数量
	PETAL_MULTIPLE_OFFSET_DISTANCE: 12, //多子花瓣远离距离

	PETAL_SYNC_INTERVAL: 25, // tick

	PETAL_OUTLINE_WIDTH_PERCENTAGE: 0.05,
	
	DROP_SIZE: 40,
	DROP_SPREAD_DISTANCE: 90,
	DROP_ACTION_TIME: 0.1,
	
	LIGHTNING_LENGTH: 250,
	
	SUFFOCATE_DAMAGE_BASE: 1,
	SUFFOCATE_DAMAGE_IMPROVE: 2,
	
	PLAYER_OXYGEN: 30
});