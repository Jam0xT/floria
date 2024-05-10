import Length from './length.js';

import styles from './styles.js';

import Menu from './menu.js';

import * as util from '../utility.js';

export default function getMenus() {
	return {
		tutorial: new Menu(
			Length.w(1).sub(Length.u(10)), Length.h(1).sub(Length.u(40)),
			{x: 'end', y: 'end'},
			Length.u(60), Length.u(40),
			function(ctx_) { // 渲染函数
				ctx_.save();
				util.Tl(ctx_, Length.u(5), Length.u(13));
				util.renderText(ctx_, ctx_.globalAlpha,
					'Tutorial',
					Length.u(0), Length.u(0),
					Length.u(10),
					'left',
					'yellow',
				);
				util.Tl(ctx_, Length.u(0), Length.u(10));
				util.renderText(ctx_, ctx_.globalAlpha,
					'Is for nobs. hehe',
					Length.u(0), Length.u(0),
					Length.u(8),
					'left',
					'white',
				);
				ctx_.restore();
			},
			styles.menu.black,
			function() {
				this.transparencyGen = {
					gen: util.gen.exponential_decrease(this.transparency, 0, 0.8),
					val: {},
				};
			},
			function() {
				this.transparencyGen = {
					gen: util.gen.logarithmic_increase(this.transparency, 100, 0.75),
					val: {},
				};	
			},
			100
		),
	}
}