import Game_Arena from './arena/arena.js';
import Game_UHC from './uhc/uhc.js';

const gamemodes = {
	'arena': Game_Arena,
	'uhc': Game_UHC,
}

export default gamemodes;