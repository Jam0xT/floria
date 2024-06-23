import * as canvas from './render/canvas.js';

import * as util from './utility.js';

import * as animation from './render/animation.js';

import Block from './render/block.js';

import * as block_main from './render/blocks/main.js';
import * as block_background from './render/blocks/background.js';
import * as block_title from './render/blocks/title.js';
import * as block_test from './render/blocks/test.js';

const blocks = {};
const updPerSecond = 60, framePerSecond = 60;

function init() { // 初始化

	// 初始化 canvas 设置
	
	canvas.init();

	// 初始化 blocks

	blocks['main'] = new Block(block_main.main);
	blocks['background'] = new Block(block_background.background);
	blocks['title'] = new Block(block_title.title);
	blocks['test'] = new Block(block_test.test);
	Object.keys(blocks).forEach(block_id => { // 自动添加所有 block 到 main
		if ( block_id != 'main' )
			blocks['main'].var.children.push(block_id);
	});
}

function start() { // 开始渲染
	broadcast('start'); // 广播开始渲染
	setInterval(blocks['main'].update.bind(blocks['main']), 1000 / updPerSecond); // 启动更新循环
	animation.play(() => { // 开始渲染
		util.clear(canvas.ctxMain); // 清空
		blocks['main'].render(canvas.ctxMain);
	});
}

function broadcast(msg, ...args) { // 向所有 block 广播消息
	Object.values(blocks).forEach(block => {
		block.onBroadcast(msg, ...args);
	});
}

export {
	init,
	start,
	blocks,
	broadcast,
	framePerSecond
}