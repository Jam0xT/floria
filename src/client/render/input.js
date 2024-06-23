function init(options = {}) {
	const $ = this.var.input = {};
	$.maxTextLength = options.maxTextLength || Infinity;
	$.text = `` //内容
	$.arrow = 0 //可以理解为箭头的位置（第n个字符右侧，从1开始计数，为0则为第一个字符左侧）
	$.hidedTextLength = 0 //隐藏的字符的长度（textAlign一侧）
	$.textAlign = `left`;
	$.textSize = this.var.ry.mul(1.2);
	
	//文本最大X坐标（超出即隐藏）
	$.max = this.var.rx.mul(2).sub(this.var.rx.mul(0.02));
		
	//文本最小X坐标（小于即隐藏）
	$.min = this.var.rx.mul(0.02);
	
	$.arrowX = $.min //箭头X坐标

	$.focus = false;
}

function handleInput(e) {
	const $ = this.var.input;
	if ( !$.focus )
		return ;
	if ( e.key.length == 1 ) { // 输入的不是功能键
		if ( e.ctrlKey && e.key == `v` ) {
			paste.bind(this)();
		} else {
			appendText.bind(this)(e.key, $.arrow);
		}
	} else if ( e.key == 'Backspace' ) {
		deleteText.bind(this)($.arrow);
	} else if ( e.key == 'Delete' ) {
		deleteText.bind(this)($.arrow + 1, true);
	} /*else if ( e.key == 'Enter' ) {
		onEnter()
	}*/ else if ( e.key.startsWith('Arrow') ) {
		const direction = e.key == `ArrowLeft` ? -1 : 1;
		moveArrow.bind(this)(direction);
	}
}

function setArrow(num) {
	const $ = this.var.input;
	if (num < 0 || num > $.text.length) { return false };
	$.arrow = num;
	return true;
}
	
function moveArrow(direction) { // -1 || 1 
    const $ = this.var.input;
    
	//setArrow方法会依据text长度判断是否移动箭头
	const isSetArrowSuccess = setArrow($.arrow + direction);
	
	if (util.getAllTextWidth($.text, $.textSize.parse()) > $.max.parse() && $.arrow == $.text.length) {
		$.textAlign = `right`;
	} else if (util.getAllTextWidth($.text, $.textSize.parse()) < $.max.parse()) {
		$.textAlign = `left`;
	}
	
	if (!isSetArrowSuccess) return false;
	//设置arrowX(若移动会超出范围将在下部分代码重新移动)
	if ($.arrow < $.hidedTextLength) { //一定超出左范围
		const delta = Length.u(-1);
		$.arrowX = $.min.add(delta);
	} else if ($.text.length - $.arrow < $.hidedTextLength) { //一定超出右范围
		const delta = Length.u(1);
		$.arrowX = $.max.add(delta);
	} else {
		if ($.textAlign == `left`) {
			let delta = Length.parseVal(util.getAllTextWidth($.text.slice($.hidedTextLength, $.arrow), $.textSize.parse()))
			delta.equalTo(Length.u(0)) ? delta = Length.u(-1) : {} //防止箭头与字重叠
			$.arrowX = $.min.add(delta) 
		} else {
			const reversedText = util.reverseString($.text);
			let delta = Length.parseVal(util.getAllTextWidth(reversedText.slice($.hidedTextLength, $.text.length - $.arrow), $.textSize.parse()))
			delta.equalTo(Length.u(0)) ? delta = Length.u(-1) : {} //防止箭头与字重叠
			$.arrowX = $.max.sub(delta);
		}
	}
	//箭头出右范围，文本左移
	if ($.arrowX.gatherthan($.max)) {
		$.hidedTextLength = $.text.length - $.arrow;
		$.arrowX = $.max;
		$.textAlign = `right`;
		return;
	}
	
	//箭头出左范围，文本右移
	if ($.arrowX.lessthan($.min)) {
		$.hidedTextLength = $.arrow;
		$.arrowX = $.min;
		$.textAlign = `left`;
		return;
	}
}

async function paste() {
	const $ = this.var.input;
	let text = await navigator.clipboard.readText().catch(e => console.error(e));
	text = text.slice(0, $.maxTextLength - $.text.length)
	appendText(text, $.arrow)
}

function appendText(text, num) {
	const $ = this.var.input;
	if ($.maxTextLength >= $.text.length + text.length) {
		$.text = $.te.slice(0, num) + text + $.text.slice(num, $.text.length);
		for (let i = 0; i < text.length; i++) {
			moveArrow(1);
		}
	}
}
	
function deleteText(num, isArrowStatic = false) { //删除第num位的文本(从1开始计数)
	const $ = this.var.input;
	if (num == 0 || num > $.text.length) return false;
	$.text = $.text.slice(0, num - 1) + $.text.slice(num, $.text.length);
	if (!isArrowStatic) {
		moveArrow(-1) //这里一定是箭头左边所以是-1
	}
}

function focus(toFocus = true) {
	const $ = this.var.input;
	$.focus = toFocus;
}

export {
	handleInput,
	focus,
	init,
	setArrow,
	moveArrow,
	appendText,
	deleteText,
	paste
};