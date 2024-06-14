import * as util from '../utility.js';

import Length from './length.js';

import Button from './button.js';

export default class Selectbox extends Button {
	constructor(options) {
		super(options);
		this.isTrigger = true;
		this.onTriggerFn = this.select;
		this.offTriggerFn = this.deselect;
		this.appendRenderFn(this.renderSelectionBase);
		this.appendRenderFn(this.renderSelection);
	}
	
	renderSelection(ctx) {
		let size;
		if (this.on) {
			size = Length.u(this.privateGens.selectionSize?.val?.value || this.style.selectionSize)
			let transparency = util.parseTransparency(this.privateGens.selectionTransparency?.val?.value || 0)
			util.blendAlpha(ctx, transparency)
		} else {
			size = Length.u(this.privateGens.selectionSize?.val?.value || 0)
			let transparency = util.parseTransparency(this.privateGens.selectionTransparency?.val?.value || 100)
			util.blendAlpha(ctx, transparency)
		}
		let x = this.ry.sub(size.mul(0.5))//this.rx.mul(0.27).sub(size.mul(0.5))
		let y = this.ry.sub(size.mul(0.5))
		util.renderRoundRect(ctx,
			x,
			y,
			size,
			size,
			[Length.u(0)]
		);
		
		ctx.fillStyle = this.style.selection;
		ctx.fill();
	}
	
	renderSelectionBase(ctx) {
		let size = Length.u(this.style.selectionBaseSize)
		let x = this.ry.sub(size.mul(0.5))//this.rx.mul(0.27).sub(size.mul(0.5))
		let y = this.ry.sub(size.mul(0.5))
		util.renderRoundRect(ctx,
			x,
			y,
			size,
			size,
			[Length.u(0)]
		);

		ctx.fillStyle = this.style.selectionBase;
		ctx.fill();
	}
	
	select() {//exponential_decrease
		this.editPrivateGen(`selectionTransparency`, {
			gen: util.gen.exponential_decrease(100, 0, 0.65),
			val: {},
		})
		this.editPrivateGen(`selectionSize`, {
			gen: util.gen.logarithmic_increase(0, this.style.selectionSize, 0.65),
			val: {},
		})
	}
	
	deselect() {
		this.editPrivateGen(`selectionTransparency`, {
			gen: util.gen.logarithmic_increase(0, 100, 0.55),
			val: {},
		})
		this.editPrivateGen(`selectionSize`, {
			gen: util.gen.exponential_decrease(this.style.selectionSize, 0, 0.85),
			val: {},
		})
	}
}