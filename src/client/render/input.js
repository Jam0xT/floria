function init() {
	const $ = this.var.input = {};
	$.focus = false;
	$.charList = [];
	$.pos = 0;
}

function handleInput(e) {
	const $ = this.var.input;
	if ( !$.focus )
		return ;
	// if ( e.key.length == 1 ) { // 输入的不是功能键
	// 	if ( e.ctrlKey && e.key == `v` ) {
	// 		this.paste();
	// 	} else {
	// 		this.appendText(e.key, this.arrow);
	// 	}
	// } else if ( e.key == 'Backspace' ) {
	// 	this.deleteText(this.arrow);
	// } else if ( e.key == 'Delete' ) {
	// 	this.deleteText(this.arrow + 1, true);
	// } else if ( e.key == 'Enter' ) {
	// 	this.onEnter()
	// } else if ( e.key.startsWith('Arrow') ) {
	// 	const direction = e.key == `ArrowLeft` ? -1 : 1;
	// 	this.moveArrow(direction);
	// }
}

function focus(toFocus = true) {
	const $ = this.var.input;
	$.focus = toFocus;
}

export {
	handleInput,
	focus,
	init,
};