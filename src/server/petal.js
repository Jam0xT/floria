const Entity = require('./entity');

class Petal extends Entity {
	constructor(id, x, y, parent, type, maxHp, noBorderCollision) {
		super(id, x, y, parent, 'petal', type, maxHp, maxHp, noBorderCollision);
		this.parent = parent;
		this.rotationVelocity = {
			x: 0,
			y: 0,
		};
	}

	update(deltaT, attribute) {
		this.velocity.x += this.rotationVelocity.x;
		this.velocity.y += this.rotationVelocity.y;
		// this.velocity.x += this.followVelocity.x;
		// this.velocity.y += this.followVelocity.y;
		super.update(deltaT, attribute);
	}

	rotate(rotationSpeed, targetRadius, targetPosition, targetCenter) {
		// const followDirection = position - clockWise * Math.PI;
		// const followMagnitude = ( radius - expandRadius ) * 1.0;
		// this.followVelocity = {
		// 	x: followMagnitude * Math.sin(followDirection),
		// 	y: followMagnitude * Math.cos(followDirection),
		// }
		// if ( this.id == 0 )
		// 	console.log(this.followVelocity, followMagnitude);
		const target = {
			x: targetCenter.x + targetRadius * Math.sin(targetPosition),
			y: targetCenter.y + targetRadius * Math.cos(targetPosition),
		};
		// const radius = Math.sqrt((targetCenter.x - this.x) ** 2 + (targetCenter.y - this.y) ** 2);

		const distance = Math.sqrt((target.x - this.x) ** 2 + (target.y - this.y) ** 2);

		const rotationSpeedMagnitude = rotationSpeed * targetRadius + distance * 2;
		// console.log(Math.abs(radius - targetRadius));
		const rotationSpeedDirection = Math.atan2(target.x - this.x, this.y - target.y);
		this.rotationVelocity = {
			x: rotationSpeedMagnitude * Math.sin(rotationSpeedDirection),
			y: rotationSpeedMagnitude * Math.cos(rotationSpeedDirection),
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