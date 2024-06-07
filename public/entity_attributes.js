export default Object.freeze({
	// an entity with bigger mass will receive less knockback
	PLAYER: {
		MASS: 100,
		SPEED: 80,
		RADIUS: 24,
		RENDER_RADIUS: 1.05,
		MAX_HP_BASE: 150,
		DAMAGE: 25,
		VALUE: 100,
		EXPERIENCE: 10,
		VOLUME: 0,
		SPAWN_AREA: {
			//area name, spawn rate     example: DESERT: 50
		},
		ATTACK_MODE: 'PLAYER',
		TYPE: 'PLAYER',
		TRIGGERS: {}
	},
	ANT_HOLE: {
		MASS: 10000,
		SPEED: 0,
		RADIUS: 40,
		RENDER_RADIUS: 1,
		MAX_HP: 300,
		DAMAGE: 15,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 1000,
		CONTENT: {
			ANT_BABY: 5,
			ANT_WORKER: 8,
			ANT_SOLDIER: 26,
			ANT_QUEEN: 1,
		},
		CONTENT_RELEASE: {
			ONHIT: {
				HP: 30,
				TIMES: 0,
				RELEASE: {
					ANT_BABY: 1,
					ANT_WORKER: 1,
					ANT_SOLDIER: 2,
				}
			},
			ONSPAWN: {
				RELEASE: {
					ANT_BABY: 2,
					ANT_WORKER: 4,
					ANT_SOLDIER: 5,
				}
			},
			ONDIE: {
				RELEASE: {
					ANT_SOLDIER: 6,
					ANT_QUEEN: 1,
				}
			}
		},
		DROP: {
		  IRIS: 1,
		  WING: 0.31,
		  EGG: 0.06,
		},
		SPAWN_AREA: {
			DESERT: 50
		},
		IDLE_MODE: 'STATIC',
		ATTACK_MODE: 'STATIC',
		TYPE: 'ANT_HOLE',
		TRIGGERS: {}
	},
	ANT_BABY: {
		MASS: 10,
		SPEED: 80,
		RADIUS: 15,
		RENDER_RADIUS: 1,
		MAX_HP: 10,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 1,
		VOLUME: 100,
		DROP: {
		  FAST: 0.44,
		  LEAF: 0.26,
		  TWIN: 0.12,
		  RICE: 0.005,
		  TRIPLET: 0.0006,
		},
		SPAWN_AREA: {
			GARDEN: 200,
			DESERT: 200
		},
		IDLE_MODE: 'NORMAL',
		ATTACK_MODE: 'PEACE',
		TYPE: 'ANT_BABY',
		TRIGGERS: {}
	},
	ANT_WORKER: {
		MASS: 10,
		SPEED: 80,
		RADIUS: 16,
		RENDER_RADIUS: 1,
		MAX_HP: 25,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 2,
		VOLUME: 100,
		DROP: {
		  FAST: 0.46,
		  LEAF: 0.28,
		  TWIN: 0.13,
		  //CORN: 0.006,
		  TRIPLET: 0.0006,
		},
		SPAWN_AREA: {
			GARDEN: 200,
			DESERT: 200
		},
		IDLE_MODE: 'NORMAL',
		ATTACK_MODE: 'NEUTRAL',
		TYPE: 'ANT_WORKER',
		TRIGGERS: {}
	},
	ANT_SOLDIER: {
		MASS: 10,
		SPEED: 80,
		RADIUS: 18,
		RENDER_RADIUS: 1,
		MAX_HP: 40,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 5,
		VOLUME: 100,
		DROP: {
		  IRIS: 0.12,
		  TWIN: 0.08,
		  FASTER: 0.03,
		  WING: 0.008,
		  TRIPLET: 0.0004,
		},
		SPAWN_AREA: {
			DESERT: 200
		},
		IDLE_MODE: 'NORMAL',
		ATTACK_MODE: 'EVIL',
		TYPE: 'ANT_SOLDIER',
		TRIGGERS: {}
	},
	ANT_QUEEN: {
		MASS: 20,
		SPEED: 80,
		RADIUS: 26,
		RENDER_RADIUS: 1,
		MAX_HP: 200,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 5,
		VOLUME: 100,
		DROP: {
		  TWIN: 1,
		  FASTER: 1,
		  WING: 0.31,
		  EGG: 0.06,
		  TRIPLET: 0.01,
		  TRI_STINGER: 0.006,
		},
		SPAWN_AREA: {
			//empty......
		},
		IDLE_MODE: 'NORMAL',
		ATTACK_MODE: 'EVIL',
		TYPE: 'ANT_QUEEN',
		TRIGGERS: {}
	},
	BEE: {
	    MASS: 10,
	    SPEED: 80,
	    RADIUS: 18,
	    RENDER_RADIUS: 1,
	    MAX_HP: 15,
	    DAMAGE: 50,
	    VALUE: 10,
	    EXPERIENCE: 10,
	    VOLUME: 100,
	    DROP: {
	      BUBBLE: 0.006,
	      FAST: 0.12,
	      HONEY: 0.01,
	      STINGER: 0.07,
	      TWIN: 0.03,
	      WING: 0.003
	    },
		SPAWN_AREA: {
			GARDEN: 200,
			DESERT: 50
		},
	    IDLE_MODE: 'FLOAT',
	    ATTACK_MODE: 'PEACE',
	    TYPE: 'BEE',
		TRIGGERS: {}
	},
	BEETLE: {
	    MASS: 20,
	    SPEED: 80,
	    RADIUS: 24,
	    RENDER_RADIUS: 1,
	    MAX_HP: 40,
	    DAMAGE: 35,
	    VALUE: 10,
	    EXPERIENCE: 5,
	    VOLUME: 100,
	    DROP: {
		  IRIS: 0.09,
		  SALT: 0.06,
	      WING: 0.06,
		  TRIPLET: 0.003,
	    },
		SPAWN_AREA: {
			DESERT: 200
		},
		DECORATES: {
			PINCER_LEFT: {
				X: -10,
				Y: -26,
				ANIMATION: {
					ROTATE: {
						X: -10,
						Y: -18,
						SPEED: 1,
						MIN: -0.5,
						MAX: 0.5,
						TYPE: `ROTATE`
					},
				},
				LAYER: -1, //为负则在mob之下, 为正在mob之上, 不要等于0
				DIRECTION: 0,
				RENDER_RADIUS: 7,
				TYPE: `BEETLE_PINCER_LEFT`
			},
			PINCER_RIGHT: {
				X: 10,
				Y: -28,
				ANIMATION: {
					ROTATE: {
						X: 10,
						Y: -20,
						SPEED: 1,
						MIN: -0.5,
						MAX: 0.5,
						TYPE: `ROTATE`
					},
				},
				LAYER: -1,
				DIRECTION: 0,
				RENDER_RADIUS: 7,
				TYPE: `BEETLE_PINCER_RIGHT`
			}
		},
	    IDLE_MODE: 'NORMAL',
	    ATTACK_MODE: 'EVIL',
	    TYPE: 'BEETLE',
		TRIGGERS: {}
	},
	BUBBLE: {
	    MASS: 10,
	    SPEED: 0,
	    RADIUS: 168,
	    RENDER_RADIUS: 1.05,
	    MAX_HP: 10,
	    DAMAGE: 5,
	    VALUE: 10,
	    EXPERIENCE: 10,
	    VOLUME: 100,
	    DROP: { BUBBLE: 0.5 },
		SPAWN_AREA: {
			OCEAN: 100
		},
		AQUATIC: true,
	    IDLE_MODE: 'NORMAL',
	    ATTACK_MODE: 'PEACE',
	    TYPE: 'BUBBLE',
		TRIGGERS: {}
	},
	BUSH: {
		MASS: 1000,
		SPEED: 0,
		RADIUS: 60,
		RENDER_RADIUS: 1,
		RADIUS_DEVIATION: {
			MIN: -20,
			MAX: 20,
		},
		MAX_HP: 36,
		HP_DEVIATION: {
			MIN: -8,
			MAX: 8,
		},
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 2,
		VOLUME: 100,
		DROP: {
			LEAF: 0.1
		},
		SPAWN_AREA: {
			JUNGLE: 200
		},
		IDLE_MODE: 'STATIC',
		ATTACK_MODE: 'PEACE',
		TYPE: 'BUSH',
		TRIGGERS: {}
	},
	CACTUS: {
		MASS: 1000,
		SPEED: 0,
		RADIUS: 60,
		RENDER_RADIUS: 1,
		RADIUS_DEVIATION: {
			MIN: -20,
			MAX: 20,
		},
		MAX_HP: 36,
		HP_DEVIATION: {
			MIN: -8,
			MAX: 8,
		},
		DAMAGE: 35,
		VALUE: 10,
		EXPERIENCE: 2,
		VOLUME: 100,
		DROP: {
			CACTUS: 0.03,
			CACTUS_TOXIC: 0.001,
			TRI_CACTUS: 0.00005,
			MISSILE: 0.009,
			STINGER: 0.05,
		},
		SPAWN_AREA: {
			DESERT: 150
		},
		IDLE_MODE: 'STATIC',
		ATTACK_MODE: 'PEACE',
		TYPE: 'CACTUS',
		TRIGGERS: {}
	},
	CENTIPEDE: {
		MASS: 100,
		SPEED: 80,
		RADIUS: 32,
		RENDER_RADIUS: 1.16,
		MAX_HP: 50,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 5,
		DROP: {
			FAST: 0.09,
			LEAF: 0.05,
			PEAS: 0.03,
			PEAS_TOXIC: 0.0005,
			TWIN: 0.02,
			TRIPLET: 0.0001,
		},
		SPAWN_AREA: {
			GARDEN: 200,
			DESERT: 100
		},
		SEGMENT: { MIN: 5, MAX: 9, NAME: 'CENTIPEDE_SEGMENT'},
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'PEACE',
		TYPE: 'CENTIPEDE',
		TRIGGERS: {}
	},
	CENTIPEDE_SEGMENT: {
		MASS: 100,
		SPEED: 80,
		RADIUS: 32,
		RENDER_RADIUS: 1,
		MAX_HP: 50,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 5,
		DROP: {
			FAST: 0.09,
			LEAF: 0.05,
			PEAS: 0.03,
			PEAS_TOXIC: 0.0005,
			TWIN: 0.02,
			TRIPLET: 0.0001,
		},
		IS_SEGMENT: true,
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'PEACE',
		TYPE: 'CENTIPEDE_SEGMENT',
		TRIGGERS: {}
	},
	CENTIPEDE_EVIL: {
		MASS: 20,
		SPEED: 80,
		RADIUS: 32,
		RENDER_RADIUS: 1.16,
		MAX_HP: 50,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 100,
		DROP: {
			IRIS: 0.82,
			PEAS_TOXIC: 0.01,
			TRIPLET: 0.003,
			//Peas Legendary: 0.001,
		},
		SPAWN_AREA: {
			DESERT: 100
		},
		SEGMENT: { MIN: 5, MAX: 10, NAME: 'CENTIPEDE_EVIL_SEGMENT'},
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'EVIL',
		TYPE: 'CENTIPEDE_EVIL',
		TRIGGERS: {}
	},
	CENTIPEDE_EVIL_SEGMENT: {
		MASS: 20,
		SPEED: 80,
		RADIUS: 32,
		RENDER_RADIUS: 1,
		MAX_HP: 50,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 100,
		DROP: {
			IRIS: 0.82,
			PEAS_TOXIC: 0.01,
			TRIPLET: 0.003,
			//Peas Legendary: 0.001,
		},
		IS_SEGMENT: true,
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'EVIL',
		TYPE: 'CENTIPEDE_EVIL_SEGMENT',
		TRIGGERS: {}
	},
	/*CRAB: {
		MASS: 20,
		SPEED: 80,
		RADIUS: 32,
		RENDER_RADIUS: 1.1,
		MAX_HP: 50,
		DAMAGE: 10,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 100,
		DROP: {
			IRIS: 0.82,
			PEAS_TOXIC: 0.01,
			TRIPLET: 0.003,
			//Peas Legendary: 0.001,
		},
		IS_SEGMENT: true,
		IDLE_MODE: 'FLOAT',
		ATTACK_MODE: 'EVIL',
		TYPE: 'CRAB',
		TRIGGERS: {}
	},*/
	DARK_LADYBUG: {
	    MASS: 20,
	    SPEED: 80,
	    RADIUS: 21,
	    RENDER_RADIUS: 1,
	    MAX_HP: 25,
	    DAMAGE: 10,
	    VALUE: 10,
	    EXPERIENCE: 10,
	    VOLUME: 100,
	    DROP: {
	      BUBBLE: 0.006,
	      DAHLIA: 0.36,
	      ROSE_ADVANCED: 0.002,
	      TRIPLET: 0.002,
	      WING: 0.04,
	      YINYANG: 0.02
	    },
		SPAWN_AREA: {
			UNKNOWN: 200
		},
	    IDLE_MODE: 'NORMAL',
	    ATTACK_MODE: 'NEUTRAL',
	    TYPE: 'DARK_LADYBUG',
		TRIGGERS: {}
	},
	HORNET: {
	    MASS: 20,
	    SPEED: 80,
	    RADIUS: 21,
	    RENDER_RADIUS: 1,
	    MAX_HP: 40,
	    DAMAGE: 50,
	    VALUE: 10,
	    EXPERIENCE: 10,
	    VOLUME: 200,
	    DROP: { DANDELION: 0.14, MISSILE: 0.09, BUBBLE: 0.05, WING: 0.03 },
		SPAWN_AREA: {
			DESERT: 20,
			UNKNOWN: 200
		},
	    IDLE_MODE: 'FLOAT',
	    ATTACK_MODE: 'EVIL',
	    MAX_CLOSE_LENGTH: 350,
	    SKILL_COOLDOWN: 2,
	    TYPE: 'HORNET',
	    TRIGGERS: { SHOOT: 'MISSILE' }
	},
	JELLYFISH: {
	    MASS: 20,
	    SPEED: 80,
	    RADIUS: 40,
	    RENDER_RADIUS: 1,
	    MAX_HP: 40,
	    DAMAGE: 40,
	    VALUE: 10,
	    EXPERIENCE: 10,
	    VOLUME: 200,
	    DROP: { LIGHTNING: 0.00114514 },
		SPAWN_AREA: {
			OCEAN: 200
		},
		AQUATIC: true,
	    IDLE_MODE: 'FLOAT',
	    ATTACK_MODE: 'EVIL',
	    MAX_CLOSE_LENGTH: 250,
	    SKILL_COOLDOWN: 1,
	    TYPE: 'JELLYFISH',
	    TRIGGERS: {
			LIGHTNING:  {
				DAMAGE: 5,
				COUNT: 4
			}
		}
	},
	LEECH: {
		MASS: 5,
		SPEED: 150,
		RADIUS: 14,
		RENDER_RADIUS: 1,
		MAX_HP: 5,
		DAMAGE: 15,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 100,
		DROP: {
			FANGS: 0.09,
			FASTER: 0.12
		},
		SPAWN_AREA: {
			OCEAN: 200
		},
		AQUATIC: true,
		SKILL_COOLDOWN: 1,
		SEGMENT: { MIN: 9, MAX: 9, NAME: 'LEECH_SEGMENT'},
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'EVIL',
		TYPE: 'LEECH',
		TRIGGERS: {
			VAMPIRISM: {
				DAMAGE: 7,
				HEAL: 1 //自身回血倍率
			},
		}
	},
	LEECH_SEGMENT: {
		MASS: 5,
		SPEED: 80,
		RADIUS: 14,
		RENDER_RADIUS: 1,
		MAX_HP: 5,
		DAMAGE: 25,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 100,
		DROP: {

		},
		AQUATIC: true,
		IS_SEGMENT: true,
		IDLE_MODE: 'FLOAT_SLOW',
		ATTACK_MODE: 'EVIL',
		TYPE: 'LEECH_SEGMENT',
		HP_CONNECT: true, //将生命值给予头部，受到的伤害转移至头部，头部死亡则自身死亡
		TRIGGERS: {}
	},
	MISSILE: {
	    MASS: 20,
	    SPEED: 250,
	    RADIUS: 12,
	    RENDER_RADIUS: 0.85,
	    MAX_HP: 10,
	    DAMAGE: 10,
	    VALUE: 10,
	    EXPERIENCE: 0,
	    VOLUME: 0,
	    IDLE_MODE: 'NORMAL',
	    ATTACK_MODE: 'PROJECTILE',
	    TYPE: 'MISSILE',
		TRIGGERS: {
			/*LIGHTNING:  {
				DAMAGE: 10,
				COUNT: 7,
				COLLIDE: true
			}*/
		}
	},
	WASP: {
		MASS: 20,
		SPEED: 80,
		RADIUS: 21,
		RENDER_RADIUS: 1,
		MAX_HP: 35,
		DAMAGE: 50,
		VALUE: 10,
		EXPERIENCE: 10,
		VOLUME: 200,
		DROP: { MISSILE: 0.09, WING: 0.03 },
		SPAWN_AREA: {
			JUNGLE: 200,
			UNKNOWN: 200
		},
		IDLE_MODE: 'FLOAT',
		ATTACK_MODE: 'EVIL',
		MAX_CLOSE_LENGTH: 550,
		SKILL_COOLDOWN: 1,
		TYPE: 'WASP',
		TRIGGERS: { SHOOT: 'MISSILE' }
	}
});

// all entity attributes are here
