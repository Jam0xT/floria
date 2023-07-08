module.exports = Object.freeze({
	// an entity with bigger mass will receive less knockback
	PLAYER: {
		MASS: 100,
		SPEED: 100,
		RADIUS: 22.5,
		MAX_HP_BASE: 150,
		DAMAGE: 25,
		EXTRA_KNOCKBACK: 0,
		VALUE: 100,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 0,
		VOLUME: 0,
		TYPE: 'PLAYER',
	},
	BUBBLE: {
		MASS: 10000,
		SPEED: 0,
		RADIUS: 60,
		MAX_HP: 1,
		DAMAGE: 5,
		EXTRA_KNOCKBACK: 0,
		VALUE: 10,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 100,
		VOLUME: 100,
		TYPE: 'BUBBLE',
	}
});

// all entity attributes are here