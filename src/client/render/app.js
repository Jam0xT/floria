import * as pixi from 'pixi.js';
import Curtain from './curtain.js';
import MainMenu from './mainMenu.js';
import ToRoomMenu from './toRoomMenu.js';
import GetRoomMenu from './getRoomMenu.js';
import RoomMenu from './roomMenu.js';
import ArenaMenu from './arenaMenu.js';
import UHCMenu from './uhcMenu.js';

class App {
	// pixi application
	application;

	// 画布 width
	W;

	// 画布 height
	H;

	// 画布单位长度 U = Math.min(W, H) / 1000
	U;

	// 用于更新子元素
	onResizeFnList;

	// 幕布
	curtain;

	// 主菜单
	mainMenu;
	
	// 获取房间菜单
	getRoomMenu;

	// 等待加入房间菜单
	toRoomMenu;

	// 房间菜单
	roomMenu;

	// Arena 菜单
	arenaMenu;

	// UHC 菜单
	uhcMenu;

	constructor() {
		this.application = new pixi.Application();
		this.onResizeFnList = [];
		this.init();
	}

	async init() {
		const app = this.application;

		await app.init({
			background: '#1ea761',
		});

		document.body.appendChild(app.canvas);

		this.curtain = new Curtain(this);
		this.mainMenu = new MainMenu(this);
		this.toRoomMenu = new ToRoomMenu(this);
		this.getRoomMenu = new GetRoomMenu(this);
		this.roomMenu = new RoomMenu(this);
		this.arenaMenu = new ArenaMenu(this);
		this.uhcMenu = new UHCMenu(this);

		this.onResize();
		window.addEventListener('resize', this.onResize.bind(this));

		this.curtain.off();
	}

	appendOnResizeFnList(onResizeFnList) {
		this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		const application = this.application;
		const dpr = window.devicePixelRatio;
		this.W = window.innerWidth * dpr;
		this.H = window.innerHeight * dpr;
		this.U = Math.min(this.W, this.H) / 1000;

		application.renderer.resolution = 1 / dpr;
		application.renderer.resize(this.W, this.H);

		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}
}

export default App;