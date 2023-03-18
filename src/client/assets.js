const ASSET_NAMES = [
	'player.svg',
	'mobs/bubble.svg',
	'petals/basic.svg',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
	return new Promise(resolve => {
		const asset = new Image();
		asset.onload = () => {
			console.log(`Downloaded ${assetName}`);
			assets[assetName] = asset;
			resolve();
		};
		asset.src = `/assets/${assetName}`;
	});
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];