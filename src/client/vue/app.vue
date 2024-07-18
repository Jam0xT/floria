<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import Block from './Block.vue';
import Title from './Title.vue';
import Button from './Button.vue';
import Text from './Text.vue';
import * as room from '../room.js';
import * as nw from '../networking.js';
import Constants from '../../shared/constants.js';
const attr = ref({
	title: {
		x: 50,
		y: -20,
	},
	button_arena: {
		x: 50,
		y: -20,
	},
	username_input: {
		x: 50,
		y: -20,
	},
	room: {
		x: 30,
		y: -20,
	},
	log: {
		x: -20,
		y: 5,
	},
	player_list: {
		x: 80,
		y: -20,
	},
	game_settings: {
		x: 60,
		y: -20,
	}
});

onMounted(() => { // 这个做法可能有潜在出错风险
	setTimeout(() => {
		attr.value.title.y = 30;
		attr.value.button_arena.y = 40;
		attr.value.username_input.y = 45;
	}, 100);
});

// 用户名输入

const username = ref('');

watch(username, (username_) => {
	if ( inRoom.value )
		room.setUsername(username_ || "Random Flower");
});

// 模式选择

const mode = ref('');

function onSelectArena() {
	attr.value.title.y = -20;
	attr.value.button_arena.y = -20;
	attr.value.username_input.y = 5;
	attr.value.room.y = 5;
	attr.value.player_list.y = 5;
	attr.value.game_settings.y = 5;
	attr.value.log.x = 5;
	mode.value = 'arena';
}

// 房间

const roomIDInput = ref('');
const roomID = ref('');
const inRoom = ref(false);
const selfID = ref('');
const ownerID = ref('');

function onRoomIDInput(e) {
	let str = e.target.value;
	roomIDInput.value = str;
}

function joinRoom() {
	room.joinRoom(mode.value, username.value || 'Random Flower', roomIDInput.value);
}

function onJoinRoom(state, roomID_ = '') {
	const msgs = [
		`Successfully joined room #${roomID_}.`,
		`Room does not exist.`,
		`Already in room.`,
		`Room is full.`,
		`Leave the current room before joining a new one.`,
	], colors = [
		'#cbfcb1',
		'#fcab9d',
		'#fcab9d',
		'#fcab9d',
		'#fcab9d',
	];
	if ( state == 0 ) {
		roomID.value = roomID_;
		roomIDInput.value = roomID_;
		inRoom.value = true;
	}
	logs.value.unshift({
		msg: msgs[state],
		color: colors[state],
	});
}

function createRoom() {
	room.createRoom(mode.value, username.value || 'Random Flower');
}

function onCreateRoom(state, roomID_ = '') {
	const msgs = [
		`Successfully created room #${roomID_}.`,
		`Can't create a new room when already in one.`,
	], colors = [
		'#cbfcb1',
		'#fcab9d',
	];
	logs.value.unshift({
		msg: msgs[state],
		color: colors[state],
	});
}

function leaveRoom() {
	room.leaveRoom();
}

function onLeaveRoom(state) {
	const msgs = [
		`Left room.`,
		`Not in a room.`,
	], colors = [
		'#9dbbfc',
		'#fcab9d',
	];
	if ( state == 0 ) {
		roomID.value = '';
		roomIDInput.value = '';
		inRoom.value = false;
		players.value = {};
		teams.value = [];
	}
	logs.value.unshift({
		msg: msgs[state],
		color: colors[state],
	});
}

function onUpdate(type, update) {
	if ( type == 0 ) {
		players.value[update.player.socketid] = update.player;
		logs.value.unshift({
			msg: `Player ${update.player.username} joined.`,
			color: "#9deefc",
		});
	} else if ( type == 1 ) {
		if ( !players.value[update.player.socketid] )
			return ;
		delete players.value[update.player.socketid];
		logs.value.unshift({
			msg: `Player ${update.player.username} left.`,
			color: "#9dbbfc",
		});
	} else if ( type == 2 ) {
		teamSize.value = update.teamSize;
		logs.value.unshift({
			msg: `Settings: TeamSize = ${teamSize.value}`,
			color: "#dedede",
		});
	} else if ( type == 3 ) {
		teamCount.value = update.teamCount;
		logs.value.unshift({
			msg: `Settings: TeamCount = ${teamCount.value}`,
			color: "#dedede",
		});
	} else if ( type == 4 ) {
		players.value[update.id].username = update.username;
	} else if ( type == 5 ) {
		teams.value = update.teams;
		Object.values(players.value).forEach(player => {
			player.team = -1;
		});
		logs.value.unshift({
			msg: `Reset teams.`,
			color: "#dedede",
		});
	} else if ( type == 6 ) {
		console.log(update.team);
		players.value[update.id].team = update.team;
		if ( update.team != -1 )
			teams.value[update.team].playerCount += 1;
		if ( update.prevTeam != -1)
			teams.value[update.prevTeam].playerCount -= 1;
		logs.value.unshift({
			msg: `Player ${players.value[update.id].username} joined team `
				+ `${update.team == -1 ? 'Random' : teams.value[update.team].color}`
				+ `${update.team == -1 ? '' : ' (' + teams.value[update.team].playerCount + '/' + teamSize.value + ')'}`,
			color: "#dedede",
		});
	}
}

function onRecvInfo(info) { // 加入房间时获取房间信息
	players.value = info.players;
	ownerID.value = info.ownerID;
	teamCount.value = info.teamCount;
	teamSize.value = info.teamSize;
	teams.value = info.teams;
	// settings.value = info.settings;
}

// 一些房间信息

const players = ref({}); // {username, socketid}
const teams = ref([]); // {color, playerCount}

// 游戏设置

const teamSize = ref(1);
const teamCount = ref(2);
const team = ref(-1); // 所在队伍
// const settings = ref({});

watch(teamSize, (teamSize_) => {
	room.updSettings(0, {teamSize: teamSize_});
	// code 0: teamSize
});

watch(teamCount, (teamCount_) => {
	room.updSettings(1, {teamCount: teamCount_});
	// code 1: teamCount
});
// code 2: username

watch(team, (team_, prevTeam_) => {
	room.updSettings(3, {team: team_, prevTeam: prevTeam_});
	// code 3: team
});

function onUpdSettings(state) {
	const msgs = [
		`Not in a room.`,
		`Room does not exist.`,
		`No permission.`,
	], colors = [
		'#fcab9d',
		'#fcab9d',
		'#fcab9d',
	];
	logs.value.unshift({
		msg: msgs[state],
		color: colors[state],
	});
}

// 日志

const logs = ref([{msg: "Log will be printed here.", color: ""}]);

// 网络

nw.connectedPromise.then(() => {
	selfID.value = nw.socket.id;
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CREATE, onCreateRoom);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, onJoinRoom);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.LEAVE, onLeaveRoom);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, onUpdate);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.INFO, onRecvInfo);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.SETTINGS, onUpdSettings);
});

</script>
<template>
	<Block :props="attr.title">
		<Title size="10">floria.io</Title>
	</Block>
	<Block :props="attr.button_arena">
		<Button @click="onSelectArena">Arena</Button>
	</Block>
	<Block :props="attr.username_input">
		<Text size="2">This pretty little flower is called...</Text>
		<input class="input" v-model="username" placeholder="Random Flower" maxlength="20"/>
	</Block>
	<Block :props="attr.log" style="width: 15%">
		<template v-for="log in logs">
			<Text size="1.5" :color="log.color" class="log">{{ log.msg }}</Text>
		</template>
	</Block>
	<Block :props="attr.room">
		<Text size="2">{{ `Room#${roomID}` }}</Text>
		<input class="input" @input="onRoomIDInput" placeholder="RoomID" maxlength="6" :disabled="inRoom" :value="roomIDInput"/><br/>
		<Button @click="joinRoom">Join</Button><br>
		<Button @click="createRoom">Create</Button><br>
		<Button @click="leaveRoom">Leave</Button><br>
	</Block>
	<Block :props="attr.player_list">
		<Text size="2" class="notransform" :color="(Object.keys(players).length == teamSize * teamCount) ? '#fffd9c' : '#FFFFFF'">
			Players
			<span>{{ Object.keys(players).length }}</span>
			/
			<span>{{ teamSize * teamCount }}</span>
		</Text>
		<template v-for="player in players">
			<Text size="2" :color="(player.team == -1) ? '#dedede' : teams[player.team].color" class="notransform">{{ player.username }}</Text>
		</template>
	</Block>
	<Block :props="attr.game_settings">
		<Text size="2" class="notransform">Settings</Text>
		<Text size="2" class="notransform">Team Size</Text>
		<select v-model="teamSize" :disabled="(ownerID != selfID) || (!inRoom)">
			<option value="1">1 Player</option>
			<option value="2">2 Players</option>
			<option value="4">4 Players</option>
		</select>
		<Text size="2" class="notransform">Team Count</Text>
		<select v-model="teamCount" :disabled="(ownerID != selfID) || (!inRoom)">
			<option value="2">2 Teams</option>
			<option value="4">4 Teams</option>
		</select>
		<Text size="2" class="notransform">Team</Text>
		<select v-model="team" :disabled="(!inRoom)">
			<option value="-1">Random</option>
			<template v-for="(team, i) in teams">
				<option :value="i" :disabled="team.playerCount == teamSize" :style="{color: team.color}">{{ `${team.color} ${team.playerCount}/${teamSize}` }}</option>
			</template>
		</select>
	</Block>
</template>

<style>
#app {
	position:absolute;
	top:0%;
	left:0%;
	width:100%;
	height:100%;
	background:#1EA761;
}

.notransform {
	transform:none;
}

.log {
	transform: none;
	position:relative;
	height: auto;
	word-wrap: break-word;
	text-align:start;
}

.input {
	transform:translate(-50%, -50%);
}
</style>