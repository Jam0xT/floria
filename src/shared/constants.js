module.exports = Object.freeze({
	TICK_PER_SECOND: 60,

	SPEED_ATTENUATION_COEFFICIENT: 0.75,
	SPEED_ATTENUATION_BIAS: 5,

	HURT_INTERVAL: 2, // tick

	MSG_TYPES: {
		JOIN_GAME: 'join_game',
		GAME_UPDATE: 'update',
		INPUT: 'input',
		GAME_OVER: 'dead',
	},

	MAP_WIDTH: 2700,
	MAP_HEIGHT: 2700,

	RENDER_DELAY: 100,

	RATED_WIDTH: 1920,
	RATED_HEIGHT: 1080,

	NEARBY_DISTANCE: 1500,
});