const ASSET_NAMES = [
	'player.svg',
	'glass_single.svg',
	'mobs/bubble.svg',
	'mobs/dark_ladybug.svg',
	'mobs/hornet.svg',
	'mobs/missile.svg',
	'petals/basic.svg',
	'petals/bubble.svg',
	'petals/cactus.svg',
	'petals/cactus_toxic.svg',
	'petals/dandelion.svg',
	'petals/egg.svg',
	'petals/faster.svg',
	'petals/glass.svg',
	'petals/heavy.svg',
	'petals/honey.svg',
	'petals/iris.svg',
	'petals/leaf.svg',
	'petals/lightning.svg',
	'petals/missile.svg',
	'petals/penta.svg',
	'petals/pollen.svg',
	'petals/rice.svg',
	'petals/rock.svg',
	'petals/rose_advanced.svg',
	'petals/rose.svg',
	'petals/salt.svg',
	'petals/stinger.svg',
	'petals/triplet.svg',
	'petals/twin.svg',
	'petals/web.svg',
	'petals/wing.svg',
	'petals/yinyang.svg',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
	return new Promise(resolve => {
		const asset = new Image();
		asset.onload = () => {
			assets[assetName] = asset;
			resolve();
		};
		asset.src = `/assets/${assetName}`;
	});
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
