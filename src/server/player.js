const Entity = require('./entity');
const Constants = require('../shared/constants');
const EntityAttributes = require('../../public/entity_attributes');
const Attribute = EntityAttributes.PLAYER;
const Petal = require('./petal');

class Player extends Entity {
	constructor(id, username, x, y) {
		super(id, x, y, id, 'mob', 'PLAYER', EntityAttributes.PLAYER.MAX_HP_BASE, EntityAttributes.PLAYER.MAX_HP_BASE, false);
		// a player's team equals to his id
		this.username = username;
		this.score = 1;
		this.haveRankOnLeaderboard = false;
		this.exp = 0;
		this.level = 1;
		this.currentExpForLevel = this.getExpForLevel(this.level);
		this.slotCount = Constants.SLOT_COUNT_BASE;
		this.petalCount = Constants.SLOT_COUNT_BASE; // petalCount <= slotCount
		this.petalObjectCount = Constants.SLOT_COUNT_BASE; // petalObjectCount doesn't always equal to petalCount because some petals have more than one object
		this.rotationSpeed = Constants.PETAL_ROTATION_SPEED_BASE;
		this.firstPetalDirection = 0;
		this.rotateClockwise = 1; // 1 for clockwise, -1 for counter-clockwise
		this.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_NORMAL;
		this.petals = [
			new Petal(0, x, y, id, 'BASIC', true),
			new Petal(1, x, y, id, 'BASIC', true),
			new Petal(2, x, y, id, 'BASIC', true),
			new Petal(3, x, y, id, 'BASIC', true),
			new Petal(4, x, y, id, 'BASIC', true),
		];
		this.activeDirection = 0;
		this.attributes = Attribute;
		this.attack = false;
		this.defend = false;
		this.bubbleVelocity = {
			x: 0,
			y: 0,
		};
		this.noHeal = 0; // 剩余禁用回血时间
		this.poison = 0; // 中毒每秒毒伤
		this.poisonTime = 0; // 剩余中毒时间
		this.bodyToxicity = 0; // 碰撞毒秒伤
		this.bodyPoison = 0; // 碰撞毒总伤
		this.damageReflect = 0.000; // 反伤
	}

	updatePetalMovement(deltaT) {
		this.firstPetalDirection -= this.rotateClockwise * this.rotationSpeed * deltaT;
		if ( this.firstPetalDirection > 2 * Math.PI ) {
			this.firstPetalDirection -= 2 * Math.PI;
		}
		if ( this.firstPetalDirection < - 2 * Math.PI ) {
			this.firstPetalDirection += 2 * Math.PI;
		}
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				if ( petal.attributes.TRIGGERS.PROJECTILE && petal.action ) {
					petal.movement = {
						direction: petal.direction,
						speed: petal.attributes.TRIGGERS.PROJECTILE,
					};
				} else {
					petal.direction = Math.atan2(petal.x - this.x, this.y - petal.y);
					const theta = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
					let expandRadius = this.petalExpandRadius + this.attributes.RADIUS;
					if ( !petal.attributes.EXPANDABLE ) {
						expandRadius = Math.min(expandRadius, Constants.PETAL_EXPAND_RADIUS_NORMAL + this.attributes.RADIUS);
					}
					if ( petal.action ) {
						expandRadius = Math.min(expandRadius, this.attributes.RADIUS + petal.attributes.RADIUS);
					}
					const goalPos = {
						x: this.x + expandRadius * Math.sin(theta),
						y: this.y + expandRadius * Math.cos(theta),
					};
					petal.movement = {
						direction: Math.atan2(goalPos.x - petal.x, petal.y - goalPos.y),
						speed: Math.sqrt((goalPos.x - petal.x) ** 2 + (goalPos.y - petal.y) ** 2) * Constants.PETAL_FOLLOW_SPEED,
					};
				}
			} else {
				petal.cooldown -= deltaT;
				if ( petal.cooldown <= 0 ) {
					petal.inCooldown = false;
					this.petals[petalID] = this.newPetal(this.petals[petalID].type, petalID);
				}
			}
		}
	}

	newPetal(type, petalID) {
		return new Petal(petalID, this.x, this.y, this.id, type, true);
	}

	handleActiveMovement(activeMovement) { // handles active motion
		this.movement = activeMovement;
		this.activeDirection = activeMovement.direction;
	}

	update(deltaT) {
		this.noHeal = Math.max(0, this.noHeal - deltaT);
		this.poisonTime = Math.max(0, this.poisonTime - deltaT);
		if ( this.poisonTime > 0 )
			this.hp -= this.poison * deltaT;
		if ( this.hp < this.maxHp && (!this.noHeal) ) {
			this.hp += ((this.maxHp / 240) * deltaT);
			this.hp = Math.min(this.hp, this.maxHp);
		}

		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				if ( petal.attributes.TRIGGERS.HEAL ) { // trigger healing petals like rose, dahlia etc.
					if ( this.hp < this.maxHp && (!this.noHeal) ) {
						if ( petal.actionCooldown > 0 ) {
							petal.actionCooldown -= deltaT;
						} else {
							if ( !petal.action ) {
								petal.action = true;
							} else {
								if ( petal.actionTime >= petal.attributes.TRIGGERS.ACTION_TIME ) {
									petal.hp = -1;
									this.hp += petal.attributes.TRIGGERS.HEAL;
									this.hp = Math.min(this.hp, this.maxHp);
								} else {
									petal.actionTime += deltaT;
								}
							}
						}
					} else {
						petal.action = false;
						petal.actionTime = 0;
					}
				}
				if ( petal.attributes.TRIGGERS.PROJECTILE ) { // trigger projectile petals like missile, dandelion etc.
					if ( petal.actionCooldown > 0 ) {
						petal.actionCooldown -= deltaT;
					} else {
						if ( !petal.action ) {
							if ( this.attack ) {
								petal.action = true;
								petal.velocity = {
									x: petal.attributes.TRIGGERS.PROJECTILE / Constants.SPEED_ATTENUATION_COEFFICIENT * Math.sin(petal.direction),
									y: petal.attributes.TRIGGERS.PROJECTILE / Constants.SPEED_ATTENUATION_COEFFICIENT * Math.cos(petal.direction),
								};
							}
						} else {
							petal.actionTime += deltaT;
							if ( petal.actionTime >= petal.attributes.TRIGGERS.ACTION_TIME ) {
								petal.hp = -1;
							}
						}
					}
				}
				if ( this.defend ) { // defend trigger
					if ( petal.attributes.TRIGGERS.BUBBLE_PUSH ) { // trigger bubble
						petal.hp = -1;
						const dir = this.firstPetalDirection + 2 * Math.PI * petal.id / this.petalObjectCount;
						const push = petal.attributes.TRIGGERS.BUBBLE_PUSH;
						this.bubbleVelocity.x -= push * Math.sin(dir);
						this.bubbleVelocity.y += push * Math.cos(dir);
					}
				}
			}
		}

	}

	updateChunks() {
		return super.updateChunks(this.attributes.RADIUS);
	}
 
	updateMovement(deltaT) {
		this.updatePetalMovement(deltaT);
	}

	updateVelocity(deltaT) {
		super.updateVelocity(deltaT);
		this.bubbleVelocity.x *= Constants.BUBBLE_ATTENUATION_COEFFICIENT;
		this.bubbleVelocity.y *= Constants.BUBBLE_ATTENUATION_COEFFICIENT;
		if ( Math.sqrt(this.bubbleVelocity.x ** 2 + this.bubbleVelocity.y ** 2) <= 50 ) {
			this.bubbleVelocity = {
				x: 0,
				y: 0,
			};
		}
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.updateVelocity(deltaT);
			}
		}
	}

	applyVelocity(deltaT) {
		super.applyVelocity(deltaT);
		this.x += deltaT * this.bubbleVelocity.x;
		this.y -= deltaT * this.bubbleVelocity.y;
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyVelocity(deltaT);
			}
		}
	}
	
	applyConstraintVelocity(deltaT) {
		super.applyConstraintVelocity(deltaT);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyConstraintVelocity(deltaT);
			}
		}
	}

	handleBorder() {
		super.handleBorder(this.attributes.RADIUS);
		for (let petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.handleBorder(petal.attributes.RADIUS);
			}
		}
	}

	reload(petalID) {
		const petal = this.petals[petalID];
		petal.cooldown = this.petals[petalID].attributes.RELOAD;
	}

	getExpForLevel(level) {
		const expCoeN = 10;
		const expCoeK = 5;
		const expCoeB = 1.08;
		// K * (B ^ L) + N
		return Math.floor(Math.pow(expCoeB, level) * expCoeK + expCoeN);
	}

	addExp(exp) {
		this.exp += exp;
		while ( this.exp >= this.currentExpForLevel ) {
			this.level ++;
			this.exp -= this.currentExpForLevel;
			this.currentExpForLevel = this.getExpForLevel(this.level);
		}
	}

	getPetalsForUpdate() {
		var petalsForUpdate = [];
		for ( var petalID = 0; petalID < this.slotCount; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petalsForUpdate.push(petal.serializeForUpdate());
			}
		}
		return petalsForUpdate;
	}

	serializeForUpdate() { // get neccesary data and send to client
		return {
			...(super.serializeForUpdate()),
			score: this.score,
			activeDirection: this.activeDirection, // the direction of input, not in use at the moment
			hp: this.hp,
			maxHp: this.maxHp,
			username: this.username,
			petals: this.getPetalsForUpdate(),
		};
	}
}

module.exports = Player;