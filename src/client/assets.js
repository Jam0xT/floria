const ASSET_NAMES = [
	'player.svg',
	'player_suffocate.svg',
	'glass_single.svg',
	'decorates/beetle_pincer_left.svg',
	'decorates/beetle_pincer_right.svg',
	'mobs/ant_hole.svg',
	'mobs/ant_baby.svg',
	'mobs/ant_worker.svg',
	'mobs/ant_soldier.svg',
	'mobs/ant_queen.svg',
	'mobs/bee.svg',
	'mobs/beetle.svg',
	'mobs/bubble.svg',
	'mobs/bush.svg',
	'mobs/cactus.svg',
	'mobs/centipede.svg',
	'mobs/centipede_segment.svg',
	'mobs/centipede_evil.svg',
	'mobs/centipede_evil_segment.svg',
	'mobs/crab.svg',
	'mobs/dark_ladybug.svg',
	'mobs/fire_ant_hole.svg',
	'mobs/fire_ant_soldier.svg',
	'mobs/hornet.svg',
	'mobs/jellyfish.svg',
	'mobs/leech.svg',
	'mobs/leech_segment.svg',
	'mobs/missile.svg',
	'mobs/wasp.svg',
	'petals/antennae.svg',
	'petals/basic.svg',
	'petals/bubble.svg',
	'petals/cactus.svg',
	'petals/cactus_toxic.svg',
	'petals/carambola.svg',
	'petals/corn.svg',
	'petals/dandelion.svg',
	'petals/dahlia.svg',
	'petals/egg.svg',
	'petals/empty.svg',
	'petals/fangs.svg',
	'petals/faster.svg',
	'petals/glass.svg',
	'petals/heavy.svg',
	'petals/honey.svg',
	'petals/iris.svg',
	'petals/leaf.svg',
	'petals/light.svg',
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
	'petals/epic_rose.svg',
	'petals/rose.svg',
	'petals/salt.svg',
	'petals/stinger.svg',
	'petals/square.svg',
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

const downloadAssets = () => downloadPromise;

const getAsset = assetName => assets[assetName];

export {
	downloadAssets,
	getAsset,
}