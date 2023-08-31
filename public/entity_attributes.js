module.exports = Object.freeze({
	// an entity with bigger mass will receive less knockback
	PLAYER: {
		MASS: 100,
		SPEED: 80,
		RADIUS: 24,
		RENDER_RADIUS: 25,
		MAX_HP_BASE: 150,
		DAMAGE: 25,
		VALUE: 100,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 0,
		VOLUME: 0,
		TYPE: 'PLAYER',
	},
	BUBBLE: {
		MASS: 10,
		SPEED: 0,
		RADIUS: 120,
		RENDER_RADIUS: 128,
		MAX_HP: 10,
		DAMAGE: 5,
		VALUE: 10,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 100,
		VOLUME: 1000,
		TYPE: 'BUBBLE',
	}
});

// all entity attributes are here