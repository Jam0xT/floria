module.exports = Object.freeze({
	// an entity with bigger mass will receive less knockback
	PLAYER: {
		MASS: 5,
		SPEED: 225,
		RADIUS: 22.5,
		MAX_HP_BASE: 1500,
		DAMAGE: 25,
		COLLISION_KNOCKBACK: 400,
		VALUE: 100,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 0,
		VOLUME: 0,
		TYPE: 'PLAYER',
	},
	BUBBLE: {
		MASS: 1,
		SPEED: 0,
		RADIUS: 120,
		MAX_HP: 500,
		DAMAGE: 5,
		COLLISION_KNOCKBACK: 1000,
		VALUE: 10,
		EXPERIENCE: 10,
		SPAWN_WEIGHT: 100,
		VOLUME: 100,
		TYPE: 'BUBBLE',
	}
});

// all entity attributes are here