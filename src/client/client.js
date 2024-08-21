import * as pixi from 'pixi.js';
import * as pixiui from '@pixi/ui';
import * as util from './utility.js';
import Room from './room.js';

import { downloadAssets } from './assets.js';

import './css/main.css';

window.onload = () => {
	document.body.style.cursor = "default";
	preventDefaultActions();
	Promise.all([
		downloadAssets(),
	]).then(() => {
		render();
	});
}

function preventDefaultActions() {
	document.onselectstart = (event) => {
		event.preventDefault();
	}
	window.addEventListener('contextmenu', (event) => {
		event.preventDefault();
	});
}

class Player { // 房间中的玩家信息类
	username;
	isReady;
	constructor(username) {
		this.username = username;
		this.isReady = false;
	}

	ready(toState = true) { // 设置 isReady 状态
		this.isReady = toState;
	}
};

const client = {
	title: 'floria.io',
	gamemode: 'none',
	username: util.getStorage('username'),
	room: {
		id: '',
		isPublic: false,
		isOwner: false,
		players: [],
		teamSize: 0,
		teamCount: 0,
		// functions: onJoin, onLeave, onPlayerJoin, onPlayerLeave, 
	},
	maps: {
		'arena': {
			'1v1': {
				id: '1v1',
				display: 'square1000;1v1',
				teamSize: 1,
				teamCount: 2,
			},
			'2v2': {
				id: '2v2',
				display: 'square1500;2v2',
				teamSize: 2,
				teamCount: 2,
			}
		},
		'uhc': {
		}
	},
};

async function render() {
	const app = new pixi.Application();

	// 初始化 app
	await app.init({
		background: '#1ea761',
	});
/*


	const devicePixelRatio = window.devicePixelRatio || 1;
	W = window.innerWidth * devicePixelRatio;
	H = window.innerHeight * devicePixelRatio;
	hpx = H / 1000;
	setCanvasDimensions(canvas);
}

function setCanvasDimensions(canvas_) {
	canvas_.width = W;
	canvas_.height = H;
	canvas_.style.width = window.innerWidth + `px`;
	canvas_.style.height = window.innerHeight + `px`;
}

*/

	document.body.appendChild(app.canvas);

	let W, H, U; // 画布 width 与 height; U 用于计算单位长度

	// 幕布 黑色
	const curtain = {
		graphics: new pixi.Graphics(),
		alphaFilter: new pixi.AlphaFilter(),
		alpha: new util.DynamicNumber(1),
		setAlpha: function(alpha) {
			this.alpha.to(alpha);
		},
		update: function() {
			this.alphaFilter.alpha = this.alpha.get();
		},
		resize: function() {
			this.graphics.clear();
			this.graphics.rect(0, 0, W, H).fill('#000000');
		},
		init: function() {
			curtain.graphics.filters = [curtain.alphaFilter];
			app.ticker.add(() => {
				curtain.update();
			});
		},
		on: function() {
			this.setAlpha(1);
		},
		off: function() {
			this.setAlpha(0);
		}
	};
	curtain.init(); // 初始化

	// 文字样式预设
	const textStyles = {
		'default': function(fontSize) {
			return new pixi.TextStyle({
				fontFamily: 'Ubuntu',
				fontWeight: 700,
				fontSize: fontSize,
				fill: '#ffffff',
				stroke: {
					color: '#000000',
					width: fontSize / 8,
				},
			});
		},
	};

	// 主菜单
	const mainMenu = {
		container: new pixi.Container(),
		title: { // 标题文字
			text: new pixi.Text({
				text: client.title,
				style: textStyles.default(72),
			}),
			resize: function() {
				this.text.x = W * 0.5;
				this.text.y = H * 0.2;
			},
			init: function() {
				this.text.anchor.set(0.5);
			},
		},
		input: {
			container: new pixi.Container(),
			input: new pixiui.Input({
				textStyle: textStyles.default(24),
				maxLength: 20,
				align: 'center',
				placeholder: 'username',
			}),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.8;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 500; // 长
				const height = 40; // 宽
				const radius = 5; // 圆角半径
				const strokeWidth = 3; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 输入框
				const input = this.input;
				input.bg = g;

				input.pivot.x = input.width / 2;
				input.pivot.y = input.height / 2;

				this.container.addChild(
					input,
				);
			},
		},
		gamemodeArena: { // Arena 游戏模式按钮
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.4;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 200; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Arena',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					client.gamemode = 'arena';
					client.username = mainMenu.getInput();
					util.setStorage('username', client.username);
					mainMenu.off();
					roomMenu.on();
				}
			},
		},
		gamemodeUHC: { // UHC 游戏模式按钮
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.5;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 200; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'UHC',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					client.gamemode = 'uhc';
					client.username = mainMenu.getInput();
					util.setStorage('username', client.username);
					mainMenu.off();
					roomMenu.on();
				}
			},
		},
		discordButton: {
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.05;
				this.container.y = H * 0.05;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 100; // 长
				const height = 30; // 宽
				const radius = 5; // 圆角半径
				const strokeWidth = 3; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Discord',
					style: textStyles.default(18),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					window.open().location = 'https://discord.gg/invite/sMAr7Q48xf';
				}
			},
		},
		getInput: function() {
			return this.input.input.text;
		},
		resize: function() {
			this.title.resize();
			this.input.resize();
			this.gamemodeArena.resize();
			this.gamemodeUHC.resize();
			this.discordButton.resize();
		},
		init: function() {
			this.title.init();
			this.input.init();
			this.gamemodeArena.init();
			this.gamemodeUHC.init();
			this.discordButton.init();
			this.container.addChild(
				this.title.text,
				this.input.container,
				this.gamemodeArena.container,
				this.gamemodeUHC.container,
				this.discordButton.container,
			);
		},
		on: function() {
			this.container.visible = true;
		},
		off: function() {
			this.container.visible = false;
		}
	};
	mainMenu.init();

	// 房间菜单
	const roomMenu = {
		container: new pixi.Container(),
		title: {
			text: new pixi.Text({
				text: 'Room',
				style: textStyles.default(72),
			}),
			resize: function() {
				this.text.x = W * 0.5;
				this.text.y = H * 0.2;
			},
			init: function() {
				this.text.anchor.set(0.5);
			},
		},
		backButton: {
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.1;
				this.container.y = H * 0.9;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 150; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Back',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					client.gamemode = 'none';
					roomMenu.off();
					mainMenu.on();
				}
			},
		},
		input: {
			container: new pixi.Container(),
			input: new pixiui.Input({
				textStyle: textStyles.default(36),
				maxLength: 6,
				align: 'center',
			}),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.36;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 250; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 输入框
				const input = this.input;
				input.bg = g;

				input.pivot.x = input.width / 2;
				input.pivot.y = input.height / 2;

				this.container.addChild(
					input,
				);
			},
		},
		createButton: {
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.44;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 200; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Create',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					// tbd
				}
			},
		},
		joinButton: {
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.52;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 200; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Join',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					// tbd
				}
			},

		},
		findPublicButton: {
			container: new pixi.Container(),
			resize: function() {
				this.container.x = W * 0.5;
				this.container.y = H * 0.6;
			},
			init: function() {
				// 底部的圆角长方形图案
				const g = new pixi.Graphics();
				const width = 300; // 长
				const height = 60; // 宽
				const radius = 10; // 圆角半径
				const strokeWidth = 5; // 边线半径

				g.roundRect(0, 0, width, height, radius);
				g.fill('#cfcfcf');
				g.stroke({
					color: '#919191',
					width: strokeWidth,
				});

				// 转换成 Sprite 便于使用
				const base = new pixi.Sprite(app.renderer.generateTexture(g));
				base.anchor.set(0.5);
				base.eventMode = 'static';
				base.cursor = 'pointer';
				base.on('pointerdown', onClick);

				// 文字
				const text = new pixi.Text({
					text: 'Find Public',
					style: textStyles.default(36),
				});
				text.anchor.set(0.5);

				// 加入 container
				this.container.addChild(
					base,
					text,
				);

				// 点击时执行
				function onClick() {
					// tbd
				}
			},

		},
		getInput: function() {
			return this.input.input.text;
		},
		resize: function() {
			this.title.resize();
			this.backButton.resize();
			this.input.resize();
			this.createButton.resize();
			this.joinButton.resize();
			this.findPublicButton.resize();
		},
		init: function() {
			this.title.init();
			this.backButton.init();
			this.input.init();
			this.createButton.init();
			this.joinButton.init();
			this.findPublicButton.init();
			this.container.addChild(
				this.title.text,
				this.backButton.container,
				this.input.container,
				this.createButton.container,
				this.joinButton.container,
				this.findPublicButton.container,
			);
			this.off();
		},
		on: function() {
			this.container.visible = true;
		},
		off: function() {
			this.container.visible = false;
		}
	}
	roomMenu.init();

	// 房间相关函数
	client.room.onJoin = function() {

	};

	client.room.onLeave = function() {
		
	}

	// Arena 菜单
	const arenaMenu = {
		container: new pixi.Container(),
		resize: function() {

		},
		init: function() {

		},
	};
	arenaMenu.init();

	// UHC 菜单
	const uhcMenu = {
		container: new pixi.Container(),
		resize: function() {

		},
		init: function() {

		},
	};
	uhcMenu.init();

	// 游戏本身
	const game = {
		container: new pixi.Container(),
		resize: function() {

		},
		init: function() {

		},
	};
	game.init();

	// 按图层顺序添加 container 到 app.stage
	(() => {
		app.stage.addChild(mainMenu.container); // 菜单
		app.stage.addChild(roomMenu.container); // 房间菜单
		app.stage.addChild(arenaMenu.container); // Arena 菜单
		app.stage.addChild(uhcMenu.container); // UHC 菜单
		app.stage.addChild(game.container); // 游戏
		app.stage.addChild(curtain.graphics); // 幕布
	})();

	// 处理 窗口大小变化 事件
	(() => {
		window.addEventListener('resize', resize);

		resize(); // 初始化
	
		function resize() {
			// 获取窗口真实大小
			const dpr = window.devicePixelRatio;
			W = window.innerWidth * dpr;
			H = window.innerHeight * dpr;
			U = Math.max(0.5, W / 1000, H / 1000);

			// 设置 app 固定大小
			app.renderer.resolution = 1 / dpr;
			app.renderer.resize(W, H);

			// 刷新各个相关元素大小
			curtain.resize();
			mainMenu.resize();
			arenaMenu.resize();
			uhcMenu.resize();
			game.resize();
			roomMenu.resize();
		}
	})();

	curtain.off();
}

export default client;