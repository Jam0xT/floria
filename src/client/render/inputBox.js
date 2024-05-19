import Menu from './menu.js';

import * as util from '../utility.js';

import styles from './styles.js';

import Length from './length.js';

export default class InputBox extends Menu {
	constructor(x, y, onOpenFn, onCloseFn, parent, attributes) {
		super(x, y, Length.u(0), Length.u(0), util.nop, styles.menu.invisible, onOpenFn, onCloseFn, parent, false, 0);
		this.element = document.createElement('input');
		document.body.appendChild(this.element);
		this.setAttribute(attributes);
	}

	render(ctx) {
		this.setAttribute({
			'left': this.getX().parse(),
			'top': this.getY().parse(),
		});
		// console.log(this.element);
		super.render(ctx);
	}

	setAttribute(attributes) {
		Object.keys(attributes).forEach(key => {
			this.element.setAttribute(key, attributes[key]);
		});
	}
}