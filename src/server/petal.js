const Constants = require('../shared/constants');
const Entity = require('./entity');
const PetalAttributes = require('../../public/petal_attributes');

class Petal extends Entity {
	constructor(id, x, y, absoluteCenter, parent, type, noBorderCollision) {
		super(id, x, y, parent, 'petal', type, PetalAttributes[type].MAX_HP, PetalAttributes[type].MAX_HP, noBorderCollision);
		this.parent = parent;
		this.rotationVelocity = {
			x: 0,
			y: 0,
		};
		this.followVelocity = {
			x: 0,
			y: 0,
		};
		this.absoluteCenter = absoluteCenter;
		this.direction = 0;
		this.radius = 0;
		this.attributes = PetalAttributes[type];
	}

	update(deltaT) {
		const activeVelocityX = this.rotationVelocity.x + this.followVelocity.x * deltaT;
		const activeVelocityY = this.rotationVelocity.y + this.followVelocity.y * deltaT;
		var activeVelocity = {
			magnitude: Math.sqrt(activeVelocityX ** 2 + activeVelocityY ** 2),
			direction: Math.atan2(activeVelocityX, activeVelocityY),
		}
		if ( activeVelocity.magnitude > Constants.PETAL_SPEED_LIMIT ) {
			activeVelocity.magnitude = Constants.PETAL_SPEED_LIMIT;
		}
		this.x += activeVelocity.magnitude * Math.sin(activeVelocity.direction);
		this.y += activeVelocity.magnitude * Math.cos(activeVelocity.direction);
		return super.update(deltaT, this.attributes);
	}

	rotateAndFollow(targetRadius, targetDirection, parentCenter) {
		const position = {
			x: this.radius * Math.sin(this.direction),
			y: this.radius * Math.cos(this.direction),
		};

		this.absoluteCenter = {
			x: this.x - position.x,
			y: this.y - position.y,
		}

		if ( this.radius < targetRadius ) {
			if ( this.radius + 10 >= targetRadius ) {
				this.radius = targetRadius;
			} else {
				this.radius += 10;
			}
		} else if ( this.radius > targetRadius ) {
			if ( this.radius - 10 <= targetRadius ) {
				this.radius = targetRadius;
			} else {
				this.radius -= 10;
			}
		}

		const targetPosition = {
			x: this.radius * Math.sin(targetDirection),
			y: this.radius * Math.cos(targetDirection),
		};

		this.direction = targetDirection;

		this.rotationVelocity = {
			x: targetPosition.x - position.x,
			y: targetPosition.y - position.y,
		};

		this.followVelocity = {
			x: Constants.PETAL_FOLLOW_SPEED * (parentCenter.x - this.absoluteCenter.x),
			y: Constants.PETAL_FOLLOW_SPEED * (parentCenter.y - this.absoluteCenter.y),
		};
	}

	serializeForUpdate() {
		return {
			...(super.serializeForUpdate()),
			type: this.type,
		};
	}
}

module.exports = Petal;