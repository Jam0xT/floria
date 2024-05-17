import Menu from './menu.js';

export default class InputBox extends Menu {
	constructor(x, y, align, rx, ry, renderFn, style, onOpenFn, onCloseFn, parent, isInitialHiding, transparency = 0) {
		super(x, y, align, rx, ry, renderFn, style, onOpenFn, onCloseFn, parent, isInitialHiding, transparency);
	}

}