class Player {
	// uuid 与连接的客户端相同
	uuid;

	client;

	isReady = false;

	isOwner = false;

	team;

	constructor(client) {
		this.client = client;
		this.uuid = client.uuid;
	}
	
	getData() {
		return {
			uuid: this.uuid,
			username: this.client.username,
			isReady: this.isReady,
		};
	}
}

export default Player;