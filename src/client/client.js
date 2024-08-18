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

async function render() {
	const app = new pixi.Application();

	// 初始化 app
	await app.init({
		background: '#1ea761',
	});

	document.body.appendChild(app.canvas);

	let W, H; // 画布 width 与 height

	// 幕布 位于最高图层 黑色
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
			this.graphics.rect(0, 0, W, H).fill(0x000000);
		}
	};

	// 初始化 curtain
	(() => {
		curtain.graphics.filters = [curtain.alphaFilter];
		app.ticker.add(() => {
			curtain.update();
		});
	})();

	// 按图层顺序添加 container 到 app.stage
	(() => {
		app.stage.addChild(curtain.graphics); // 幕布 最高图层
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
		}
	})();

	curtain.setAlpha(0);
}