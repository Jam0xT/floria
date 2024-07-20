/*
处理实体

$ = this.var
*/

function init() {
	const $ = this.var;
	$.entities = {};
}

function addEntity(uuid, entity) {
	const $ = this.var;
	$.entities[uuid] = entity;
}

export {
	init,
	addEntity,
};