module.exports = Object.freeze({
	TICK_PER_SECOND: 25,

	SPEED_ATTENUATION_COEFFICIENT: 0.75,
	SPEED_ATTENUATION_BIAS: 5,

	HURT_INTERVAL: 0, // tick

	MSG_TYPES: {
		JOIN_GAME: 'join_game',
		GAME_UPDATE: 'update',
		INPUT: 'input',
		GAME_OVER: 'dead',
	},

	MAP_WIDTH: 3000,
	MAP_HEIGHT: 3000,

	RENDER_DELAY: 100,

	RATED_WIDTH: 1920,
	RATED_HEIGHT: 1080,

	NEARBY_DISTANCE: 1500,

	LEADERBOARD_LENGTH: 10,

	MOB_VOLUME_LIMIT: 1000,
	MOB_SPAWN_INTERVAL: 60,

	CHUNK_SIZE: 50,
	CHUNK_ID_CONSTANT: 114514,

	SCORE_LOOTING_COEFFICIENT: 0.5,

	PETAL_ROTATION_SPEED_BASE: 2.5,

	SLOT_COUNT_BASE: 5,

	PETAL_FOLLOW_SPEED: 20.0,

	PETAL_SPEED_LIMIT: 36,
});