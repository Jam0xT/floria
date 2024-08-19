import * as pixi from 'pixi.js';
import * as util from './utility.js';

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

const client = {
	title: 'floria.io',
};

async function render() {
	const app = new pixi.Application();

	// 初始化 app
	await app.init({
		background: '#1ea761',
	});

	document.body.appendChild(app.canvas);

	let W, H; // 画布 width 与 height

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
				this.text.y = H * 0.3;
			},
			init: function() {
				this.text.anchor.set(0.5);
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
					// tbd
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
					// tbd
				}
			},
		},
		resize: function() {
			this.title.resize();
			this.gamemodeArena.resize();
			this.gamemodeUHC.resize();
		},
		init: function() {
			this.title.init();
			this.gamemodeArena.init();
			this.gamemodeUHC.init();
			this.container.addChild(
				this.title.text,
				this.gamemodeArena.container,
				this.gamemodeUHC.container,
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

	// Arena 菜单
	const arenaMenu = {
		container: new pixi.Container(),
	};

	// 按图层顺序添加 container 到 app.stage
	(() => {
		app.stage.addChild(mainMenu.container); // 菜单
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

			// 设置 app 固定大小
			app.renderer.resolution = 1 / dpr;
			app.renderer.resize(W, H);

			// 刷新各个相关元素大小
			curtain.resize();
			mainMenu.resize();
		}
	})();

	curtain.setAlpha(0);
}

export default client;