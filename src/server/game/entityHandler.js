/*
处理实体

$ = this.var
*/
import * as playerHandler from './playerHandler.js';

function init() { // Game 调用
	// 初始化
	const $ = this.var;
	$.entities = {};
}

function addEntity(uuid, entity) { // Game 调用
	// 添加一个实体
	const $ = this.var;
	$.entities[uuid] = entity;
}

function move(dir, val) { // Entity 调用
	// 设定移动方向与速度（加速度）
	// 一个实体的加速度就是当前刻中最后一次接收到的 movement，也就是说 movement 就是加速度
	const $ = this.var;
	$.movement.dir = dir;
	$.movement.val = val;
}

function updateAcceleration(dt) { // 更新加速度
	const $ = this.var;
	Object.values($.entities).forEach(entity => {
		const movement = entity.var.movement;
		entity.var.a = {
			x: movement.val * Math.cos(movement.dir),
			y: movement.val * Math.sin(movement.dir),
		};
	});
}

function updateVelocity(dt) {
	const $ = this.var;
	const friction = $.props.friction ??= 0.7; // 摩擦力 若摩擦力未设置 则设为 0.7
	Object.values($.entities).forEach(entity => {
		const a = entity.var.a; // 实体加速度
		const v = entity.var.v;
		v.x *= friction;
		v.y *= friction;
		v.x += a.x * dt;
		v.y += a.y * dt;

		const v_list = entity.var.v_list; // 其他速度列表
		v_list.forEach((vel, i)=> {
			vel.x *= vel.resistance;
			vel.y *= vel.resistance;
			if ( Math.sqrt(vel.x * vel.x + vel.y * vel.y) < 1 ) { // 衰减到消失
				delete v_list[i];
				return ;
			}
		});
	});
}

function appendVelocity(x, y, resistance) { // Entity 调用
	const $ = this.var;
	$.v_list.push({
		x: x,
		y: y,
		resistance: resistance,
	});
}

function updatePosition(dt) {
	const $ = this.var;
	Object.values($.entities).forEach(entity => {
		const v = entity.var.v; // 速度
		const pos = entity.var.pos;
		pos.x += v.x * dt;
		pos.y += v.y * dt;
		const v_list = entity.var.v_list; // 其他速度列表
		v_list.forEach((vel)=> {
			pos.x += vel.x * dt;
			pos.y += vel.y * dt;
		});
	});
}

function handleEntityDeaths() {
	const $ = this.var;
	Object.values($.entities).forEach(entity => {
		if ( !entity )
			return ;
		if ( entity.var.attr.hp <= 0 ) {
			if ( entity.var.type == 'player' )
				playerHandler.handlePlayerDeath.bind(this)(entity);
			delete $.entities[entity.uuid];
		}
	});
}

export {
	init,
	move,
	addEntity,
	updateAcceleration,
	updateVelocity,
	appendVelocity,
	updatePosition,
	handleEntityDeaths,
};