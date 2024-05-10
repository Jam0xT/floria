import Length from './length.js';

import styles from './styles.js';

import Button from './button.js';

import * as util from '../utility.js';

export default function getButtons() {
	return {
		tutorial: new Button(
			Length.w(1).sub(Length.u(20)), Length.h(1).add(Length.u(20)),
			{x: 'center', y: 'center'},
			Length.u(10), Length.u(10),
			function(ctx_) {
				util.renderText(ctx_, ctx_.globalAlpha,
					'?',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.tutorial,
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.unitLength, -20, 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.unitLength, 20, 0.85),
					val: {},
				};	
			},
			0,
		),
	};
}