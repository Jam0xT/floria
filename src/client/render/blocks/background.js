import * as canvas from '../canvas.js';
import * as util from '../../utility.js';
import styles from '../styles.js';
import { getAsset } from '../../assets.js';
import { updPerSecond } from '../../render.js';

const petalList = [
	'antennae',
	'basic',
	'bubble',
	'cactus_toxic',
	'cactus',
	'carambola',
	'corn',
	'dahlia',
	'dandelion',
	'egg',
	'fangs',
	'fast',
	'faster',
	'heavy',
	'honey',
	'iris',
	'leaf',
	'lightning',
	'missile',
	'peas_legendary',
	'peas',
	'penta',
	'pollen',
	'rice',
	'rock',
	'rose_advanced',
	'rose',
	'salt',
	'square',
	'stinger',
	'web',
	'wing',
	'yinyang',
	'yucca',
];

function getRandomPetalAsset() {
	const randomId = util.randomInt(0, petalList.length - 1);
	const assetName = `petals/${petalList[randomId]}.svg`;
	const asset = getAsset(assetName);
	if ( !asset ) {
		console.log(randomId, assetName);
	}
	return asset;
}

const background = {
	floatingPetals: [],
	updTimer: 0,
	onBroadcast: {
		'init': function() {
		}
	},
	updateFn: function() {
		const $ = this.var;
		$.updTimer += 1;
		if ( $.updTimer % 15 == 0 ) {
			$.floatingPetals.push({
				x: -50,
				y: util.random(0, canvas.H),
				img: getRandomPetalAsset(),
				vx: util.random(200, 500),
				vy: util.random(-15, 15),
				size: util.random(5, 15),
				r: 0,
				vr: util.random(Math.PI * 0.1, Math.PI * 1),
			});
		}
		let doneFloatingPetals = [];
		$.floatingPetals.forEach((p, i) => {
			p.x += p.vx / updPerSecond;
			p.y += p.vy / updPerSecond;
			p.r += p.vr / updPerSecond;
			if ( p.x - p.size * canvas.unitLength > canvas.W ) {
				doneFloatingPetals.push(i);
			}
		});
		doneFloatingPetals.forEach(id => {
			$.floatingPetals.splice(id, 1);
		});
	},
	renderFn: function(ctx) {
		const $ = this.var;
		util.fillBackground(ctx, styles.background.menu);
		$.floatingPetals.forEach(p => {
			const renderRadius = p.size * canvas.unitLength;
			const asset = p.img;
			const width = asset.naturalWidth, height = asset.naturalHeight;
	
			ctx.save();

			ctx.translate(p.x, p.y);
			ctx.rotate(p.r);
			if ( width <= height ) {
				ctx.drawImage(
					asset,
					- renderRadius,
					- renderRadius / width * height,
					renderRadius * 2,
					renderRadius / width * height * 2,
				);
			} else {
				ctx.drawImage(
					asset,
					- renderRadius / height * width,
					- renderRadius,
					renderRadius / height * width * 2,
					renderRadius * 2,
				);
			}

			ctx.restore();
		});
	},
};

export {
	background,
};