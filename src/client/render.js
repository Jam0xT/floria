import * as canvas from './render/canvas.js';

import * as util from './utility.js';

import * as animation from './render/animation.js';

import Block from './render/block.js';

import * as blockSettings from './render/blocks/blocks.js';

const blocks = {};
const updPerSecond = 60, framePerSecond = 60;
const updInterval = 1000 / updPerSecond;
const localRenderDelay = 50;

function init() { // 初始化

	// 初始化 canvas 设置
	
	canvas.init();

	// 初始化 blocks

	blocks['main'] = new Block(blockSettings.main);
	blocks['background'] = new Block(blockSettings.background);
	blocks['title'] = new Block(blockSettings.title);
	blocks['arena'] = new Block(blockSettings.arena);
	blocks['title_small'] = new Block(blockSettings.title_small);
	blocks['name_input'] = new Block(blockSettings.name_input);
	blocks['room'] = new Block(blockSettings.room);
	blocks['room_join'] = new Block(blockSettings.room_join);
	blocks['room_create'] = new Block(blockSettings.room_create);
	blocks['room_id_input'] = new Block(blockSettings.room_id_input);
	blocks['back'] = new Block(blockSettings.back);
}

function start() { // 开始渲染
	broadcast('init'); // 广播渲染初始化
	setInterval(blocks['main'].update.bind(blocks['main']), updInterval); // 启动更新循环
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

/*
init: 开始渲染
start: 开始界面
mouse_move: 鼠标移动
mouse_down: 鼠标按下
mouse_up: 鼠标松开
key_down: 键盘按下
key_up: 键盘松开
room: 选择游戏模式后准备进入房间
*/

export {
	init,
	start,
	blocks,
	broadcast,
	framePerSecond,
	updPerSecond,
	updInterval,
	localRenderDelay,
}