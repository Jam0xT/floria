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
		this.totalExp = 0;
		this.level = 1;
		this.currentExpForLevel = this.getExpForLevel(this.level);
		this.rotationSpeed = Constants.PETAL_ROTATION_SPEED_BASE;
		this.firstPetalDirection = 0;
		this.rotateClockwise = 1; // 1 for clockwise, -1 for counter-clockwise
		this.petalExpandRadius = Constants.PETAL_EXPAND_RADIUS_NORMAL;
		this.slotCount = Constants.PRIMARY_SLOT_COUNT_BASE;
		this.placeHolder = Constants.PRIMARY_SLOT_COUNT_BASE; // how many places are there
		this.petalID = Constants.FIRST_PETAL_ID;
		this.primaryPetals = [];
		this.secondaryPetals = [];
		for (let i = 0; i < Constants.PRIMARY_SLOT_COUNT_BASE; i ++ ) {
			this.primaryPetals.push('BASIC');
		}
		for ( let i = 0; i < Constants.SECONDARY_SLOT_COUNT_BASE; i ++ ) {
			this.secondaryPetals.push('NONE');
		}
		this.secondaryPetals[0] = 'STINGER';
		this.secondaryPetals[1] = 'RICE';
		this.secondaryPetals[2] = 'BUBBLE';
		this.secondaryPetals[3] = 'MISSILE';
		this.secondaryPetals[4] = 'ROSE_ADVANCED';
		this.petals = [
			new Petal(0, 0, 0, x, y, id, 'BASIC', true),
			new Petal(1, 1, 1, x, y, id, 'BASIC', true),
			new Petal(2, 2, 2, x, y, id, 'BASIC', true),
			new Petal(3, 3, 3, x, y, id, 'BASIC', true),
			new Petal(4, 4, 4, x, y, id, 'BASIC', true),
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

	disablePetal(slot) {
		let petal = this.petals[slot];
		petal.disabled = true;
		petal.inCooldown = true;
		petal.cooldown = petal.attributes.RELOAD;
	}

	switchPetals(slot1, slot2, implement) {
		let tmp;
		if ( (!slot1.isPrimary) && slot2.isPrimary ) {
			tmp = slot1;
			slot1 = slot2;
			slot2 = tmp;
		}
		if ( slot1.isPrimary && slot2.isPrimary ) {
			if ( implement ) {
				let petalA = this.petals.find(ptl => (ptl.placeHolder == slot1.slot));
				let petalB = this.petals.find(ptl => (ptl.placeHolder == slot2.slot));
				petalA.disabled = false;
				petalB.disabled = false;
				tmp = petalA.type;
				petalA.type = petalB.type;
				petalB.type = tmp;
				petalA.updateAttributes();
				petalB.updateAttributes();
			} else {
				tmp = this.primaryPetals[slot1.slot];
				this.primaryPetals[slot1.slot] = this.primaryPetals[slot2.slot];
				this.primaryPetals[slot2.slot] = tmp;
			}
		}
		else if ( slot1.isPrimary && (!slot2.isPrimary) ) {
			if ( implement ) {
				let petal = this.petals.find(ptl => (ptl.placeHolder == slot1.slot));
				petal.disabled = false;
				petal.type = this.primaryPetals[slot1.slot];
				petal.updateAttributes();
			} else {
				tmp = this.primaryPetals[slot1.slot];
				this.primaryPetals[slot1.slot] = this.secondaryPetals[slot2.slot];
				this.secondaryPetals[slot2.slot] = tmp;
			}
		} else {
			if ( !implement ) {
				tmp = this.secondaryPetals[slot1.slot];
				this.secondaryPetals[slot1.slot] = this.secondaryPetals[slot2.slot];
				this.secondaryPetals[slot2.slot] = tmp;
			}
		}
	}

	updatePetalMovement(deltaT) {
		this.firstPetalDirection -= this.rotateClockwise * this.rotationSpeed * deltaT;
		if ( this.firstPetalDirection > 2 * Math.PI ) {
			this.firstPetalDirection -= 2 * Math.PI;
		}
		if ( this.firstPetalDirection < - 2 * Math.PI ) {
			this.firstPetalDirection += 2 * Math.PI;
		}
		for (let petalIDX = 0; petalIDX < this.petals.length; petalIDX ++ ) {
			const petal = this.petals[petalIDX];
			if ( !petal.inCooldown ) {
				if ( petal.attributes.TRIGGERS.PROJECTILE && petal.action ) {
					petal.movement = {
						direction: petal.direction,
						speed: petal.attributes.TRIGGERS.PROJECTILE,
					};
				} else {
					petal.direction = Math.atan2(petal.x - this.x, this.y - petal.y);
					const theta = this.firstPetalDirection + 2 * Math.PI * petal.placeHolder / this.placeHolder;
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
						speed: Math.sqrt((goalPos.x - petal.x) ** 2 + (goalPos.y - petal.y) ** 2) * (1 - Constants.SPEED_ATTENUATION_COEFFICIENT) / deltaT,
					};
					// console.log(petal.velocity);
				}
			} else {
				if ( !petal.disabled ) {
					petal.cooldown -= deltaT;
					if ( petal.cooldown <= 0 ) {
						this.petals[petalIDX] = this.newPetal(petal.attributes.TYPE, this.getNewPetalID(), petal.idx, petal.placeHolder);
					}
				}
			}
		}
	}

	newPetal(type, petalID, petalIDX, placeHolder) {
		return new Petal(petalID, petalIDX, placeHolder, this.x, this.y, this.id, type, true);
	}

	handleActiveMovement(activeMovement) { // handles active motion
		this.movement = activeMovement;
		this.activeDirection = activeMovement.direction;
	}

	update(deltaT) {
		// console.log(this.primaryPetals, this.secondaryPetals);
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
								const projectile = this.newPetal(petal.type, this.getNewPetalID(), -1, -1);
								projectile.action = true;
								projectile.x = petal.x;
								projectile.y = petal.y;
								projectile.direction = petal.direction;
								projectile.velocity = {
									x: petal.attributes.TRIGGERS.PROJECTILE / Constants.SPEED_ATTENUATION_COEFFICIENT * Math.sin(petal.direction),
									y: petal.attributes.TRIGGERS.PROJECTILE / Constants.SPEED_ATTENUATION_COEFFICIENT * Math.cos(petal.direction),
								};
								this.petals.push(projectile);
								this.reload(petal.placeHolder);
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
						const dir = this.firstPetalDirection + 2 * Math.PI * petal.placeHolder / this.placeHolder;
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
		for (let petalID = 0; petalID < this.petals.length; petalID ++ ) {
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
		for (let petalID = 0; petalID < this.petals.length; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyVelocity(deltaT);
			}
		}
	}
	
	applyConstraintVelocity(deltaT) {
		super.applyConstraintVelocity(deltaT);
		for (let petalID = 0; petalID < this.petals.length; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.applyConstraintVelocity(deltaT);
			}
		}
	}

	handleBorder() {
		super.handleBorder(this.attributes.RADIUS);
		for (let petalID = 0; petalID < this.petals.length; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petal.handleBorder(petal.attributes.RADIUS);
			}
		}
	}

	reload(placeHolder) {
		const petal = this.petals.find(ptl => (ptl.placeHolder == placeHolder));
		petal.cooldown = petal.attributes.RELOAD;
		petal.inCooldown = true;
	}

	getNewPetalID() {
		this.petalID ++;
		return this.petalID;
	}

	getExpForLevel(level) {
		const expCoeN = 10;
		const expCoeK = 8;
		const expCoeB = 1.1;
		// K * (B ^ L) + N
		return Math.floor(Math.pow(expCoeB, level) * expCoeK + expCoeN);
	}

	addExp(exp) {
		this.exp += exp;
		this.totalExp += exp;
		while ( this.exp >= this.currentExpForLevel ) {
			this.level ++;
			this.exp -= this.currentExpForLevel;
			this.currentExpForLevel = this.getExpForLevel(this.level);
		}
	}

	getPetalsForUpdate() {
		var petalsForUpdate = [];
		for ( var petalID = 0; petalID < this.petals.length; petalID ++ ) {
			const petal = this.petals[petalID];
			if ( !petal.inCooldown ) {
				petalsForUpdate.push(petal.serializeForUpdate());
			}
		}
		return petalsForUpdate;
	}

	serializeForUpdate(self) { // get neccesary data and send to client
		if ( self ) {
			return {
				...(super.serializeForUpdate()),
				score: this.score,
				hp: this.hp,
				maxHp: this.maxHp,
				currentExpForLevel: this.currentExpForLevel,
				level: this.level,
				exp: this.exp,
				username: this.username,
				petals: this.getPetalsForUpdate(),
				primaryPetals: this.primaryPetals,
				secondaryPetals: this.secondaryPetals,
			};
		} else {
			return {
				...(super.serializeForUpdate()),
				score: this.score,
				hp: this.hp,
				maxHp: this.maxHp,
				username: this.username,
				petals: this.getPetalsForUpdate(),
			};
		}
	}
}

module.exports = Player;