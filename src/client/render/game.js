import * as pixi from 'pixi.js';
import World from './game/world.js';
import UI from './game/ui.js';
import StateProcessor from './game/stateProcessor.js';

class Game {
	app;

	container = new pixi.Container();

	world = new World(this);

	ui = new UI(this);

	stateProcessor = new StateProcessor();

	teamColors = [];

	state;

	// 自身实体uuid
	selfEntityUUID;

	constructor(app) {
		this.app = app;
		this.container.addChild(
			this.world.container,
			this.ui.container,
		);
		app.application.ticker.add(this.update.bind(this));
		app.application.stage.addChild(this.container);
		this.off();
	}

	// 重置数据
	reset() {
		this.stateProcessor.reset();
	}

	// 设置队伍颜色
	setTeamColors(teamColors) {
		this.teamColors = teamColors;
	}

	// 初始化
	init(data) {
		this.world.setSize(data.map.width, data.map.height);
		this.world.setVision(data.vision);
		this.world.setLoadDistance(data.loadDistance);
		this.selfEntityUUID = data.uuid;
	}

	// 处理原始更新数据
	processRawUpdate(update) {
		this.stateProcessor.process(update);
	}

	// 更新渲染内容 ticker
	update() {
		this.state = this.stateProcessor.get();
		this.world.update();
		this.ui.update();
	}

	on() {
		this.container.visible = true;
		this.ui.startCapturingInput();
	}

	off() {
		this.container.visible = false;
		this.ui.stopCapturingInput();
	}
};

export default Game;