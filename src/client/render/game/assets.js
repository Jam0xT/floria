import * as pixi from 'pixi.js';

function getAsset(assetName, radius) {
	const container = new pixi.Container();
	const asset = new pixi.Graphics();
	container.addChild(asset);
	switch ( assetName ) {
		case 'player': {
			asset.circle(100, 100, 72);
			asset.fill('#ffe763');
			asset.stroke({color:'#cfbb50',width:16});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		case 'petal/basic': {
			asset.circle(100, 100, 72);
			asset.fill('#ffffff');
			asset.stroke({color:'#cfcfcf',width:32});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		case 'petal/rose': {
			asset.circle(100, 100, 72);
			asset.fill('#ff94c9');
			asset.stroke({color:'#cf78a3',width:32});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		case 'petal/bubble': {
			asset.circle(100,100,64);
			asset.fill({color:'#ffffff',alpha:180,width:16});
			asset.circle(100,100,72);
			asset.stroke({color:'#ffffff',alpha:70,width:16});
			asset.circle(121,79,18);
			asset.fill({color:'#ffffff',alpha:150,width:16});
			asset.pivot.x = 100;
			asset.pivot.y = 100;
			break;
		}
		case 'petal/stinger': {
			asset.poly([{x: 80, y: 65.36}, {x: 140, y: 100}, {x: 80, y: 134.64}]);
			asset.fill('#333333');
			asset.stroke({color:'#292929', width:32, join:'round'});
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