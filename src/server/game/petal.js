import Entity from './entity.js';

class Petal extends Entity {
	constructor(id, x, y, team, attr) {
		super('petal', x, y, team, attr);
		const $ = this.var;
	}
};

export default Petal;