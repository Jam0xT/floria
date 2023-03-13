module.exports = Object.freeze({
	PLAYER: {
		MASS: 5,
		SPEED: 225,
		RADIUS: 22.5,
		MAX_HP_BASE: 150,
		BODY_DAMAGE: 25,
		COLLISION_KNOCKBACK: 750,
		VALUE: 10,
		SPAWN_WEIGHT: 0,
		VOLUME: 0,
		TYPE: 'PLAYER',
	},
	BUBBLE: {
		MASS: 1,
		SPEED: 0,
		RADIUS: 250,
		MAX_HP: 1000,
		BODY_DAMAGE: 5,
		COLLISION_KNOCKBACK: 2500,
		VALUE: 5,
		SPAWN_WEIGHT: 100,
		VOLUME: 100,
		TYPE: 'BUBBLE',
	}
});

// all entity attributes are here