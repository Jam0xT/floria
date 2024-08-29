import * as pixi from 'pixi.js';

function getAsset(assetName) {
	const asset = new pixi.Graphics();
	switch ( assetName ) {
		case 'petal/basic': {
			asset.circle(100, 100, 72);
			asset.fill('#ffffff');
			asset.circle(100, 100, 72);
			asset.stroke({color:'#cfcfcf',width:16});
			break;
		}
		default: {
			asset.rect(0, 0, 10, 10);
			asset.fill('#000000');
			break;
		}
	}
	asset.pivot.x = asset.width / 2;
	asset.pivot.y = asset.height / 2;
	return asset;
}

export {
	getAsset,
}