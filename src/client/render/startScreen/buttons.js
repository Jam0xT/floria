import Length from '../length.js';

import styles from '../styles.js';

import Button from '../button.js';

import * as util from '../../utility.js';

export default function getButtons() {
	return {
		start_tutorial: new Button(
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
			styles.button.default,
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
			'start',
			false,
			0,
		),
		start_arena: new Button(
			Length.w(0.5), Length.h(0.4).sub(Length.u(250)),
			{x: 'center', y: 'center'},
			Length.u(75), Length.u(15),
			function(ctx_) {
				util.renderText(ctx_, ctx_.globalAlpha,
					'Arena',
					this.rx, this.ry.add(Length.u(7)),
					Length.u(20),
				);
			},
			styles.button.default,
			function() {
				this.yGen = {
					gen: util.gen.logarithmic_increase(this.y.unitLength, 0, 0.85),
					val: {},
				};
			},
			function() {
				this.yGen = {
					gen: util.gen.exponential_decrease(this.y.unitLength, -250, 0.85),
					val: {},
				};
			},
			'start',
			false,
			0,
		),
		arena_back: new Button(
			Length.w(0).add(Length.u(20)), Length.h(1).add(Length.u(20)),
			{x: 'center', y: 'center'},
			Length.u(10), Length.u(10),
			function(ctx_) {
				util.renderText(ctx_, ctx_.globalAlpha,
					'<',
					this.rx, this.ry.add(Length.u(6)),
					Length.u(20),
				);
			},
			styles.button.default,
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
			'arena',
			false,
			0,
		),
	};
}