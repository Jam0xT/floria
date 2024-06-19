import Length from '../length.js';

import styles from '../styles.js';

import Menu from '../menu.js';

import Button from '../button.js';

import Inputbox from '../inputbox.js';

import Selectbox from '../selectbox.js'

import * as util from '../../utility.js';

import * as room from '../room.js';

import { socket } from '../../networking.js';

const menus = {
	start: new Menu({
		x: Length.w(0),
		y: Length.h(0),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.u(0),
		oy: Length.u(0),
		renderFn: util.nop(),
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.children.forEach(child => {
				child.open(true);
			});
		},
		onCloseFn: function () {
			this.children.forEach(child => {
				child.close();
			});
		},
		parent: 'root',
		isInitialHiding: true,
		transparency: 0
	}),
	start_tutorial: new Menu({
		x: Length.u(-50),
		y: Length.u(-60),
		rx: Length.u(60),
		ry: Length.u(40),
		ox: Length.u(-50),
		oy: Length.u(-60),
		renderFn: function (ctx) { // 渲染函数
			ctx.save();
			util.Tl(ctx, Length.u(5), Length.u(13));
			util.renderText(ctx, ctx.globalAlpha,
				'Tutorial',
				Length.u(0), Length.u(0),
				Length.u(10),
				'left',
				'yellow',
			);
			util.Tl(ctx, Length.u(0), Length.u(10));
			util.renderText(ctx, ctx.globalAlpha,
				'Is for nobs. hehe',
				Length.u(0), Length.u(0),
				Length.u(8),
				'left',
				'white',
			);
			ctx.restore();
		},
		style: styles.menu.default,
		onOpenFn: function () {
			this.transparencyGen = {
				gen: util.gen.exponential_decrease(this.transparency, 0, 0.8),
				val: {},
			};
		},
		onCloseFn: function () {
			this.transparencyGen = {
				gen: util.gen.logarithmic_increase(this.transparency, 100, 0.75),
				val: {},
			};
		},
		parent: 'start_tutorial_button',
		isInitialHiding: true,
		transparency: 100
	}),
	start_title: new Menu({
		x: Length.w(0.5),
		y: Length.h(0).sub(Length.u(50)),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(0.5),
		oy: Length.h(0.3),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'floria.io',
				Length.u(0), Length.u(0),
				Length.u(50),
				'center',
				'white',
			);
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0.3).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
				val: {},
			};
		},
		parent: 'start',
		isInitialHiding: false,
		transparency: 0
	}),
	start_tutorial_button: new Button({
		x: Length.w(1).sub(Length.u(20)),
		y: Length.h(1).add(Length.u(20)),
		rx: Length.u(10),
		ry: Length.u(10),
		ox: Length.w(1).sub(Length.u(20)),
		oy: Length.h(1).sub(Length.u(20)),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'?',
				this.rx, this.ry.add(Length.u(7)),
				Length.u(20),
			);
		},
		style: styles.button.default,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.h(1).sub(Length.u(20)).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(1).add(Length.u(20)).parse(), 0.85),
				val: {},
			};
		},
		onHoverFn: function () {
			menus.start_tutorial.open()
		},
		offHoverFn: function () {
			menus.start_tutorial.close()
		},
		parent: 'start',
		isInitialHiding: false,
		transparency: 0
	}),
	start_arena_button: new Button({
		x: Length.w(0.5),
		y: Length.h(0).sub(Length.u(50)),
		rx: Length.u(75),
		ry: Length.u(15),
		ox: Length.w(0.5),
		oy: Length.h(0.4),
		renderFn: function (ctx_) {
			util.renderText(ctx_, ctx_.globalAlpha,
				'Arena',
				this.rx, this.ry.add(Length.u(7)),
				Length.u(20),
			);
		},
		style: styles.button.default,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0.4).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
				val: {},
			};
		},
		onTriggerFn: function () {
			menus.start.close();
			menus.arena.open();
		},
		parent: 'start',
		isInitialHiding: false,
		transparency: 0
	}),
	arena: new Menu({
		x: Length.w(0),
		y: Length.h(0),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(0),
		oy: Length.h(0),
		renderFn: util.nop(),
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.children.forEach(child => {
				child.open(true);
			});
		},
		onCloseFn: function () {
			this.children.forEach(child => {
				child.close();
			});
		},
		parent: 'root',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_room: new Menu({
		x: Length.w(1).add(Length.u(100)),
		y: Length.h(0.3),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(0.7),
		oy: Length.h(0.3),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'Room',
				Length.u(0), Length.u(0),
				Length.u(30),
				'center',
				'white',
			);
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.xGen = {
				gen: util.gen.exponential_decrease(this.x.parse(), Length.w(0.7).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.xGen = {
				gen: util.gen.logarithmic_increase(this.x.parse(), Length.w(1).add(Length.u(100)).parse(), 0.85),
				val: {},
			};
		},
		parent: 'arena',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_back_button: new Button({
		x: Length.w(0).add(Length.u(20)),
		y: Length.h(1).add(Length.u(20)),
		rx: Length.u(10),
		ry: Length.u(10),
		ox: Length.w(0).add(Length.u(20)),
		oy: Length.h(1).sub(Length.u(20)),
		renderFn: function (ctx_) {
			util.renderText(ctx_, ctx_.globalAlpha,
				'<',
				this.rx, this.ry.add(Length.u(6)),
				Length.u(20),
			);
		},
		style: styles.button.default,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.h(1).sub(Length.u(20)).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(1).add(Length.u(20)).parse(), 0.85),
				val: {},
			};
		},
		onTriggerFn: function () {
			menus.arena.close();
			menus.start.open();
			room.quitRoom(false);
		},
		parent: 'arena',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_room_create_button: new Button({
		x: Length.u(0),
		y: Length.u(25),
		rx: Length.u(40),
		ry: Length.u(10),
		ox: Length.u(0),
		oy: Length.u(25),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'Create',
				this.rx, this.ry.add(Length.u(7)),
				Length.u(20),
			);
		},
		style: styles.button.default,
		onTriggerFn: function () {
			room.createRoom('arena');
		},
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_room_join_button: new Button({
		x: Length.u(0),
		y: Length.u(55),
		rx: Length.u(40),
		ry: Length.u(10),
		ox: Length.u(0),
		oy: Length.u(55),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'Join',
				this.rx, this.ry.add(Length.u(7)),
				Length.u(20),
			);
		},
		style: styles.button.default,
		onTriggerFn: function () {
			room.joinRoom('arena', room.menus.arena_room_id_input.text);
		},
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_room_id_input: new Inputbox({
		x: Length.u(0),
		y: Length.u(90),
		rx: Length.u(40),
		ry: Length.u(15),
		ox: Length.u(0),
		oy: Length.u(90),
		style: styles.inputbox.default,
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 0,
		maxTextLength: 6,
	}),
	arena_room_ready_button: new Button({
		x: Length.u(0),
		y: Length.u(220),
		rx: Length.u(40),
		ry: Length.u(15),
		ox: Length.u(0),
		oy: Length.u(220),
		renderFn: function (ctx) {
			if(room.playerRoom)
				util.renderText(ctx, ctx.globalAlpha,
					'Ready',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
					'center',
					room.playerRoom.players[socket.id].isReady?'green':'red',
				);
		},
		style: styles.button.default,
		onTriggerFn: function () {
			room.readyChange();
		},
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 100
	}),
	arena_room_quit_button: new Button({
		x: Length.u(0),
		y: Length.u(270),
		rx: Length.u(40),
		ry: Length.u(15),
		ox: Length.u(0),
		oy: Length.u(270),
		renderFn: function (ctx) {
			if(room.playerRoom)
				util.renderText(ctx, ctx.globalAlpha,
					'Quit',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
					'center',
					'red',
				);
		},
		style: styles.button.default,
		onTriggerFn: function () {
			room.quitRoom(true);
		},
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 100
	}),
	test_selectbox: new Selectbox({
		x: Length.u(0),
		y: Length.u(140),
		rx: Length.u(80),
		ry: Length.u(10),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				'Devmode: Test',
				this.rx.add(Length.u(8)), this.ry.add(Length.u(5)),
				Length.u(15),
			);
		},
		style: styles.selectbox.default,
		onOpenFn: function () {

		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_title: new Menu({
		x: Length.w(0).add(Length.u(45)),
		y: Length.h(0).sub(Length.u(50)),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(0).add(Length.u(45)),
		oy: Length.h(0).add(Length.u(25)),
		renderFn: function (ctx) {
			ctx.save();

			util.blendAlpha(ctx, 0.7);

			util.renderText(ctx, ctx.globalAlpha,
				'floria.io',
				Length.u(0), Length.u(0),
				Length.u(20),
				'center',
				'white',
			);

			ctx.restore();
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0).add(Length.u(25)).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.h(0).sub(Length.u(50)).parse(), 0.85),
				val: {},
			};
		},
		parent: 'arena',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_playerlist: new Menu({
		x: Length.w(-0.4),
		y: Length.h(0),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(-0.4),
		oy: Length.h(0),
		renderFn: function (ctx) {
			let nowRoom = room.playerRoom;
			if(nowRoom == null || nowRoom == undefined)
				return ;
			util.renderText(ctx, ctx.globalAlpha,
				'Players',
				Length.u(0), Length.u(0),
				Length.u(30),
				'center',
				'white',
			);
			let faction = nowRoom.players[socket.id].faction;
			let nowpos = 30;
			for (let playerId in nowRoom.players) {
				let player = nowRoom.players[playerId];
				if (player.faction == faction) {
					util.renderText(ctx, ctx.globalAlpha,
						player.nickName+((player.id==nowRoom.owner)?'(owner)':''),
						Length.u(0), Length.u(nowpos),
						Length.u(15),
						'center',
						player.faction,
					);
					if(player.isReady == true)
						util.renderText(ctx, ctx.globalAlpha,
							'ready',
							Length.u(150), Length.u(nowpos),
							Length.u(15),
							'center',
							'green',
						);
					nowpos += 20;
				}
			}
			nowpos += 20;
			for (let playerId in nowRoom.players) {
				let player = nowRoom.players[playerId];
				if (player.faction != faction) {
					util.renderText(ctx, ctx.globalAlpha,
						player.nickName+((player.id==nowRoom.owner)?'(owner)':''),
						Length.u(0), Length.u(nowpos),
						Length.u(15),
						'center',
						player.faction,
					);
					if(player.isReady == true)
						util.renderText(ctx, ctx.globalAlpha,
							'ready',
							Length.u(150), Length.u(nowpos),
							Length.u(15),
							'center',
							'green',
						);
					nowpos += 20;
				}
			}
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.xGen = {
				gen: util.gen.logarithmic_increase(this.x.parse(), Length.w(0.3).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.xGen = {
				gen: util.gen.exponential_decrease(this.x.parse(), Length.u(-100).parse(), 0.85),
				val: {},
			};
		},
		parent: 'arena_room',
		isInitialHiding: false,
		transparency: 0
	}),
	arena_room_join_msg: new Menu({
		x: Length.u(0),
		y: Length.u(190),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.u(0),
		oy: Length.u(170),
		renderFn: function (ctx) {
			util.renderText(ctx, ctx.globalAlpha,
				room.roomMsg,
				Length.u(0), Length.u(0),
				Length.u(20),
				'center',
				room.roomMsgCol,
			);
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.transparency = 0;
			this.transparencyGen = {
				gen: util.gen.logarithmic_increase(this.transparency, 100, 0.98),
				val: {},
			};
		},
		onCloseFn: function () {

		},
		parent: 'arena_room',
		isInitialHiding: true,
		transparency: 100
	}),
	arena_room_title: new Menu({
		x: Length.w(0.4),
		y: Length.u(-100),
		rx: Length.u(0),
		ry: Length.u(0),
		ox: Length.w(0.4),
		oy: Length.h(0.2),
		renderFn: function (ctx) {
			var text;
			if (room.playerRoom == null)
				text = 'You are not in room now';
			else
				text = `You are in room #${room.playerRoom.id}`;
			util.renderText(ctx, ctx.globalAlpha,
				text,
				Length.u(0), Length.u(0),
				Length.u(20),
				'center',
				'white',
			);
		},
		style: styles.menu.invisible,
		onOpenFn: function () {
			this.yGen = {
				gen: util.gen.logarithmic_increase(this.y.parse(), Length.h(0.2).parse(), 0.85),
				val: {},
			};
		},
		onCloseFn: function () {
			this.yGen = {
				gen: util.gen.exponential_decrease(this.y.parse(), Length.u(-100).parse(), 0.85),
				val: {},
			};
		},
		parent: 'arena',
		isInitialHiding: false,
		transparency: 0
	}),
}

export default function getMenus() {
	return menus;
}