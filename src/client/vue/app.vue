<script setup>
import { ref, onMounted } from 'vue';
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
		x: 30,
		y: -20,
	},
	game_settings: {
		x: 70,
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

const username = ref('Random Flower');

function onUsernameInput(e) {
	let str = e.target.value;
	username.value = str;
	if ( username.value == '' )
		username.value = "Random Flower";
	room.setUsername(username.value);
}

// 模式选择

const mode = ref('');

function onSelectArena() {
	attr.value.title.y = -20;
	attr.value.button_arena.y = -20;
	attr.value.username_input.y = 5;
	attr.value.room.y = 5;
	attr.value.player_list.y = 30;
	attr.value.game_settings.y = 5;
	attr.value.log.x = 5;
	mode.value = 'arena';
}

// 房间

const roomIDInput = ref('');
const roomID = ref('');
const inRoom = ref(false);

function onRoomIDInput(e) {
	let str = e.target.value;
	roomIDInput.value = str;
}

function joinRoom() {
	room.joinRoom(mode.value, username.value, roomIDInput.value);
}

function onJoinRoom(state, roomID_ = '') {
	const msgs = [
		`Successfully joined room #${roomID_}.`,
		`Room does not exist.`,
		`Already in room.`,
		`Room is full.`,
		`Leave the current room before joining a new one.`,
	];
	if ( state == 0 ) {
		roomID.value = roomID_;
		roomIDInput.value = roomID_;
		inRoom.value = true;
	}
	logs.value.unshift({
		msg: msgs[state],
		color: (state == 0) ? '#cbfcb1' : '#fcab9d',
	});
}

function createRoom() {
	room.createRoom(mode.value, username.value);
}

function onCreateRoom(state, roomID_ = '') {
	const msgs = [
		`Successfully created room #${roomID_}.`,
		`Can't create a new room when already in one.`,
	];
	logs.value.unshift({
		msg: msgs[state],
		color: (state == 0) ? '#cbfcb1' : '#fcab9d',
	});
}

function leaveRoom() {
	room.leaveRoom();
}

function onLeaveRoom(state) {
	const msgs = [
		`Successfully left room.`,
		`Not in a room.`,
	];
	if ( state == 0 ) {
		roomID.value = '';
		roomIDInput.value = '';
		inRoom.value = false;
	}
	logs.value.unshift({
		msg: msgs[state],
		color: (state == 0) ? '#cbfcb1' : '#fcab9d',
	});
}

// 日志

const logs = ref([{msg: "Log will be printed here.", color: ""}]);

// 网络

nw.connectedPromise.then(() => {
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CREATE, onCreateRoom);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.JOIN, onJoinRoom);
	nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.LEAVE, onLeaveRoom);
	// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.UPDATE, updatedRoom);
	// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.GETROOM, gotRoomOfPlayer);
	// nw.socket.on(Constants.MSG_TYPES.SERVER.ROOM.CHECKOWNER, checkedOwner);
	// nw.socket.on(Constants.MSG_TYPES.SERVER.GAME.START, startGame);
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
		<input class="input" @input="onUsernameInput" placeholder="Random Flower" maxlength="20"/>
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
		<Text size="2">Players</Text>
	</Block>
	<Block :props="attr.game_settings">
		<Text size="2">Settings</Text>
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