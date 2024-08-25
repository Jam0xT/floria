import chalk from 'chalk';

const server = {
	
};

const room = {
	addPlayer: function(roomID, uuid) { // 加入玩家
		console.log(
			chalk.gray('[') +
			chalk.gray('#') + 
			chalk.blue(roomID) +
			chalk.gray(']') +
			' ' +
			chalk.green('+') +
			' ' +
			chalk.gray(uuid)
		);
	},
	removePlayer: function(roomID, uuid) { // 移除玩家
		console.log(
			chalk.gray('[') +
			chalk.gray('#') + 
			chalk.blue(roomID) +
			chalk.gray(']') +
			' ' +
			chalk.red('-') +
			' ' +
			chalk.gray(uuid)
		);
	},
	create: function(id) { // 创建房间
		console.log(
			chalk.green('+') +
			' ' +
			chalk.gray('#') + 
			chalk.blue(id)
		);
	}
}

export default {
	server,
	room,
};