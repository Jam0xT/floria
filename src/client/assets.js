const ASSET_NAMES = [
	'player.svg',
	'glass_single.svg',
	'mobs/bee.svg',
	'mobs/beetle.svg',
	'mobs/bubble.svg',
	'mobs/cactus.svg',
	'mobs/centipede.svg',
	'mobs/centipede_segment.svg',
	'mobs/centipede_evil.svg',
	'mobs/centipede_evil_segment.svg',
	'mobs/dark_ladybug.svg',
	'mobs/hornet.svg',
	'mobs/missile.svg',
	'petals/basic.svg',
	'petals/bubble.svg',
	'petals/cactus.svg',
	'petals/cactus_toxic.svg',
	'petals/carambola.svg',
	'petals/dandelion.svg',
	'petals/dahlia.svg',
	'petals/egg.svg',
	'petals/empty.svg',
	'petals/fast.svg',
	'petals/faster.svg',
	'petals/glass.svg',
	'petals/heavy.svg',
	'petals/honey.svg',
	'petals/iris.svg',
	'petals/leaf.svg',
	'petals/lightning.svg',
	'petals/missile.svg',
	'petals/peas.svg',
	'petals/peas_single.svg',
	'petals/peas_toxic.svg',
	'petals/peas_toxic_single.svg',
	'petals/peas_legendary.svg',
	'petals/peas_legendary_single.svg',
	'petals/penta.svg',
	'petals/pollen.svg',
	'petals/rice.svg',
	'petals/rock.svg',
	'petals/rose_advanced.svg',
	'petals/rose.svg',
	'petals/salt.svg',
	'petals/stinger.svg',
	'petals/tri_cactus.svg',
	'petals/tri_stinger.svg',
	'petals/triplet.svg',
	'petals/twin.svg',
	'petals/web.svg',
	'petals/wing.svg',
	'petals/yinyang.svg',
	'petals/yucca.svg',
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
