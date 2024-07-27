import Entity from './entity.js';

class Petal extends Entity {
	constructor(id, parent, idx, subidx, x, y, team, attr) {
		super('petal', x, y, team, attr);
		const $ = this.var;
		$.id = id; // 花瓣 id 如 basic
		$.parent = parent; // 所属实体 uuid
		$.idx = idx; // 所属抽象花瓣的编号
		$.subidx = subidx; // 在所属抽象花瓣实例集合中的编号（多子花瓣）
		$.unbound = false; // 是否解绑
	}
};

export default Petal;