module.exports = Object.freeze({
	TICK_PER_SECOND: 25, // server runs X updates per second

	SPEED_ATTENUATION_COEFFICIENT: 0.65, // velocity *= X every tick if it isn't constant
	// SPEED_ATTENUATION_BIAS: 5, // a velocity will be removed if its magnitude is lower than X

	HURT_INTERVAL: 0, // X (tick)

	MSG_TYPES: { // socket.io communication
		JOIN_GAME: 'join_game',
		GAME_UPDATE: 'update',
		INPUT: 'input',
		GAME_OVER: 'dead',
	},

	MAP_WIDTH: 3000, // width of the map
	MAP_HEIGHT: 3000, // height of the map

	RENDER_DELAY: 100, // render delay to make the animation smooth

	RATED_WIDTH: 1920, // rated rendering size on client
	RATED_HEIGHT: 1080,

	NEARBY_DISTANCE: 2500, // an entity will not be loaded on the client if its distance from the player >= X

	LEADERBOARD_LENGTH: 10, // the leaderboard will display you and the top X players

	MOB_VOLUME_LIMIT: 10000, // mobs won't spawn if the sum of volumes of all mobs alive >= X
	MOB_SPAWN_INTERVAL: 10, // try to spawn mobs every X ticks

	CHUNK_SIZE: 200, // the size of each chunk
	CHUNK_ID_CONSTANT: 114514, // help get the id of each chunk

	SCORE_LOOTING_COEFFICIENT: 0.5, // your score will increase by X*S when you kill a player whose score is S

	PETAL_ROTATION_SPEED_BASE: 2.5, // default player petal rotation speed

	PETAL_FOLLOW_SPEED: 8, // how fast petals follow players

	SLOT_COUNT_BASE: 5, // default player slot count

	PENETRATION_DEPTH_WEIGHT_IN_COLLISION: 1, // decides how much penetration depth will effect collision knockback

	VELOCITY_WEIGHT_IN_COLLISION: 2, // decides how much velocity will effect collision knockback

	BASE_KNOCKBACK: 300, // base knockback when colliding
});