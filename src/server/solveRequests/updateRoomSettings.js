import Constants from "../../shared/constants.js";
import { createData } from "../server.js";

export default function onPlayerRequestUpdateRoomSettings(value, ws) {
	const player = ws.player;

	if (!player.room) return;
	
	const settings = value.settings;
	if ( settings.mapID ) {
		player.room.updateSettings({
			mapID: settings.mapID,
		});
	}
	if ( settings.isPrivate ) {
		player.room.updateSettings({
			isPrivate: settings.isPrivate,
		});
	}

	player.room.sendAll(createData(
		Constants.MSG_TYPES.SERVER.ROOM.UPDATE_SETTINGS,
		{
			settings: settings,
		}
	), [player.uuid]);
}