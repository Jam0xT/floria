import Menu from './menu.js';

import * as util from '../utility.js';

import styles from './styles.js';

import Length from './length.js';

import Button from './button.js';

import { unitLength } from './canvas.js';

export default class Inputbox extends Button {
	constructor(options) {
		super(options);
		this.maxTextLength = options.maxTextLength || Infinity;
		this.text = options.text || `` //内容
		this.arrow = 0 //可以理解为箭头的位置（第n个字符右侧，从1开始计数，为0则为第一个字符左侧）
		this.hidedTextLength = 0 //隐藏的字符的长度（textAlign一侧）
		this.textAlign = `left`;
		this.textSize = this.ry.mul(1.2);
		
		//文本最大X坐标（超出即隐藏）
		this.max = this.rx.mul(2).sub(Length.u(4));
			
		//文本最小X坐标（小于即隐藏）
		this.min = Length.u(4);
		
		this.arrowX = this.min //箭头X坐标
		
		this.isTrigger = false;
		this.onTriggerFn = this.focus;
		this.offTriggerFn = util.nop;
		this.onHoverFn = util.nop;
		this.offHoverFn = util.nop;
		this.outRangeFn = this.unfocus;
		this.onEnterFn = options.onEnterFn || util.nop;
		
		this.renderFn = function(ctx) {
			//渲染文本内容
			
			const displayText = this.textAlign == `left` ? this.text.slice(this.hidedTextLength, this.text.length) : this.text.slice(0, this.text.length - this.hidedTextLength);
			
			const textX = this.textAlign == `left` ? this.min.add(Length.u(2)) : this.max.sub(Length.u(2));
			
			util.renderText(ctx, 1,
				displayText,
				textX, this.ry.add(this.ry.mul(0.45)),
				this.ry.mul(1.2),
				this.textAlign,
				'Black',
				{
					w: this.max.sub(this.min.mul(1)),
					h: this.ry.mul(2)
				}
			);
			
			//渲染箭头
			if (!this.isFocus) return;
			
			this.arrowTimer ++;
			
			if (this.arrowTimer / 30 < 1) return;
			
			util.renderRoundRect(ctx, 
				this.arrowX, 
				this.ry.sub(this.ry.mul(0.65)),
				Length.u(1),
				this.ry.mul(1.3),
				[Length.u(0)]
			);
			ctx.fillStyle = `Black`;
			ctx.fill();
			
			if (this.arrowTimer == 60) this.arrowTimer = 0;
			
		}
		this.arrowTimer = 0 //小竖杠的计时器
		
		window.addEventListener('keydown', this.onType.bind(this));
	}

	focus(e) {
		this.arrowTimer = 30
		this.isFocus = true;
		
		/*if (this.textAlign == `left`) {
			const dpr = window.devicePixelRatio;
			const x = e.clientX * dpr
			const baseX = this.getX().sub(this.rx);
			
		}*/
	}
	
	unfocus() {
		this.isFocus = false;
	}
	
	onType(e) {
		if (this.isFocus) {
			if (e.key.length == 1) { //输入的不是功能键
				this.appendText(e.key, this.arrow);
			} else if (e.key == 'Backspace') {
			    this.deleteText(this.arrow);
			} else if (e.key == 'Enter') {
				this.onEnter()
			} else if (e.key.startsWith('Arrow')) {
				const direction = e.key == `ArrowLeft` ? -1 : 1;
				this.moveArrow(direction);
			}
		}
	}
	
	setArrow(num) {
		if (num < 0 || num > this.text.length) { return false };
		this.arrow = num;
		return true;
	}
	
	moveArrow(direction) { // -1 || 1 
		//setArrow方法会依据text长度判断是否移动箭头
		const isSetArrowSuccess = this.setArrow(this.arrow + direction);
		
		if (util.getAllTextWidth(this.text, this.textSize.parse()) > this.max.parse() && this.arrow == this.text.length) {
			this.textAlign = `right`;
		} else if (util.getAllTextWidth(this.text, this.textSize.parse()) < this.max.parse()) {
			this.textAlign = `left`;
		}
		
		if (!isSetArrowSuccess) return false;

		//设置arrowX(若移动会超出范围将在下部分代码重新移动)
		if (this.arrow < this.hidedTextLength) { //一定超出左范围
			const delta = Length.u(-1);
			this.arrowX = this.min.add(delta);
		} else if (this.text.length - this.arrow < this.hidedTextLength) { //一定超出右范围
			const delta = Length.u(1);
			this.arrowX = this.max.add(delta);
		} else {
			if (this.textAlign == `left`) {
				let delta = Length.parseVal(util.getAllTextWidth(this.text.slice(this.hidedTextLength, this.arrow), this.textSize.parse()))
				delta.equalTo(Length.u(0)) ? delta = Length.u(-1) : {} //防止箭头与字重叠
				this.arrowX = this.min.add(delta) 
			} else {
				const reversedText = util.reverseString(this.text);
				let delta = Length.parseVal(util.getAllTextWidth(reversedText.slice(this.hidedTextLength, this.text.length - this.arrow), this.textSize.parse()))
				delta.equalTo(Length.u(0)) ? delta = Length.u(-1) : {} //防止箭头与字重叠
				this.arrowX = this.max.sub(delta);
			}
		}

		//箭头出右范围，文本左移
		if (this.arrowX.gatherthan(this.max)) {
			this.hidedTextLength = this.text.length - this.arrow;
			this.arrowX = this.max;
			this.textAlign = `right`;
			return;
		}
		
		//箭头出左范围，文本右移
		if (this.arrowX.lessthan(this.min)) {
			this.hidedTextLength = this.arrow;
			this.arrowX = this.min;
			this.textAlign = `left`;
			return;
		}
	}
	
	onEnter() {
		this.onEnterFn(this.text);
	}
	
	appendText(text, num) {
		if (this.maxTextLength >= this.text.length + text.length) {
			this.text = this.text.slice(0, num) + text + this.text.slice(num, this.text.length);
			this.moveArrow(1)
		}
	}
	
	deleteText(num) { //删除第num位的文本(从1开始计数)
		if (num == 0) return false;
		this.text = this.text.slice(0, num - 1) + this.text.slice(num, this.text.length);
		this.moveArrow(-1) //这里一定是箭头左边所以是-1
	}
}

/*
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
*/

