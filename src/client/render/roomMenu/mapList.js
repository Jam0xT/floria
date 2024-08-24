import * as pixi from 'pixi.js';
import textStyles from '../textStyles.js';
import client from '../../index.js';
import maps from '../../maps.js';
import Room from '../../room.js';

class MapList {
	parent;

	container;

	maps;

	// 选中的地图id
	selected;

	gamemode;

	onResizeFnList;

	constructor(parent) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.maps = {};
		this.gamemode = '';
		this.selected = '';
		this.onResizeFnList = [];
		this.init();
	}

	init() {
		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	appendOnResizeFnList(onResizeFnList) {
		this.onResizeFnList.push(...onResizeFnList);
	}

	onResize() {
		const W = client.app.W, H = client.app.H;
		this.container.x = W * 0.5;
		this.container.y = H * 0.2;
		this.onResizeFnList.forEach(onResizeFn => {
			onResizeFn();
		});
	}

	setGamemode(gamemode) {
		if ( (!gamemode) || (gamemode == this.gamemode) ) // 如果 gamemode 为空或者和现有 gamemode 相同则不变
			return ;

		// 设置 gamemode
		this.gamemode = gamemode;

		// 清空 onResizeFnList
		this.onResizeFnList = [];

		// 移除旧的 Map 实例的 pixi container
		Object.values(this.maps).forEach(map => {
			map.container.destroy(true);
		});

		// 清空旧的 Map 实例集合
		this.maps = {};

		// 创建新的 Map 实例
		Object.keys(maps[this.gamemode]).forEach((mapID, index) => {
			const newMap = new Map(this, mapID, maps[this.gamemode][mapID].display, index);
			this.maps[mapID] = newMap;
		});

		// 选择默认地图
		this.select(Object.keys(maps[this.gamemode])[0]);
	}

	select(mapID) {
		if ( !client.app.roomMenu.isOwner )
			return ;
		if ( !maps[this.gamemode][mapID] ) {
			throw new Error(`Selecting undefined map '${this.gamemode}-${mapID}'.`);
		}
		if ( this.selected == mapID )
			return ;
		if ( this.selected )
			this.maps[this.selected].unselect();
		this.selected = mapID;
		this.maps[this.selected].select();
		Room.requestUpdateSettings({
			mapID: mapID,
		});
	}
}

class Map {
	parent;

	container;

	// 地图id
	id;

	// 展示文字
	display;

	// 位置
	displayIndex;

	// 展示文字的 pixi 对象
	text;

	constructor(parent, id, display, displayIndex) {
		this.parent = parent;
		this.container = new pixi.Container();
		this.id = id;
		this.display = display;
		this.displayIndex = displayIndex;
		this.text = new pixi.Text({
			style: textStyles.default(18),
		});
		this.init();
	}

	init() {
		// 底部的圆角长方形图案
		const g = new pixi.Graphics();
		const width = 200; // 长
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
		const base = new pixi.Sprite(client.app.application.renderer.generateTexture(g));
		base.anchor.set(0.5);
		base.eventMode = 'static';
		base.cursor = 'pointer';
		base.on('pointerdown', this.onClick.bind(this));

		// 文字
		const text = this.text;
		text.text = this.display;
		text.anchor.set(0.5);

		// 加入 container
		this.container.addChild(
			base,
			text,
		);

		this.onResize();
		this.parent.appendOnResizeFnList([this.onResize.bind(this)]);
		this.parent.container.addChild(this.container);
	}

	onResize() {
		// const W = client.app.W, H = client.app.H;
		this.container.x = 0;
		this.container.y = 40 * this.displayIndex;
	}

	onClick() {
		this.parent.select(this.id);
	}

	select() {
		this.text.text = this.display + ' <';
	}

	unselect() {
		this.text.text = this.display;
	}
}

export default MapList;