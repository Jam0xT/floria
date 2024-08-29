import * as pixi from 'pixi.js';

function getAsset(assetName, radius) {
	const container = new pixi.Container();
	const asset = new pixi.Graphics();
	container.addChild(asset);
	switch ( assetName ) {
		case 'player': {
			asset.circle(100, 100, 72);
			asset.fill('#ffe763');
			asset.circle(100, 100, 72);
			asset.stroke({color:'#cfbb50',width:16});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		case 'petal/basic': {
			asset.circle(100, 100, 72);
			asset.fill('#ffffff');
			asset.circle(100, 100, 72);
			asset.stroke({color:'#cfcfcf',width:32});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		default: {
			asset.rect(0, 0, 10, 10);
			asset.fill('#000000');
			break;
		}
	}
	asset.scale = 2 * radius / asset.width;
	return container;
}

export {
	getAsset,
}