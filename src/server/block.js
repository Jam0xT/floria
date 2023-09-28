const Constants = require('../shared/constants');

class Block {
	constructor(x, y) {
		this.x = x * Constants.BLOCK_WIDTH;
		this.y = y * Constants.BLOCK_HEIGHT;
		this.entities = {
			mob: [],
			player: [],
			drop: [],
		};
	}
}

module.exports = Block;