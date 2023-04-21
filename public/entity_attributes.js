module.exports = Object.freeze({
	// an entity with bigger mass will receive less knockback
	PLAYER: {
		MASS: 500,
		SPEED: 225,
		RADIUS: 22.5,
		MAX_HP_BASE: 15000,
		DAMAGE: 25,
		COLLISION_KNOCKBACK: 0,
		VALUE: 100,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 0,
		VOLUME: 0,
		TYPE: 'PLAYER',
	},
	BUBBLE: {
		MASS: 200,
		SPEED: 0,
		RADIUS: 120,
		MAX_HP: 50000,
		DAMAGE: 5,
		COLLISION_KNOCKBACK: 0,
		VALUE: 10,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 100,
		VOLUME: 100,
		TYPE: 'BUBBLE',
	}
});

// all entity attributes are here