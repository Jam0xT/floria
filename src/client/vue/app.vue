<script setup>
import { ref, onMounted } from 'vue';
import Block from './Block.vue';
import Title from './Title.vue';
import Button from './Button.vue';
import Input from './Input.vue';
import Text from './Text.vue';
import * as room from '../room.js';
const attr = ref({
	title: {
		x: 50,
		y: -20,
		tr: true,
	},
	button_arena: {
		x: 50,
		y: -20,
		tr: true,
	},
	username_input: {
		x: 50,
		y: -20,
		tr: true,
	},
	room: {
		x: 30,
		y: -20,
		tr: true,
	},
	log: {
		x: -20,
		y: 5,
		tr: true,
	}
});

onMounted(() => { // 这个做法可能有潜在出错风险
	setTimeout(() => {
		attr.value.title.y = 30;
		attr.value.button_arena.y = 40;
		attr.value.username_input.y = 45;
	}, 100);
});

const username = ref('Random Flower');

function onUsernameInput(e) {
	let str = e.target.value;
	username.value = str;
	if ( username.value == '' )
		username.value = "Random Flower";
	room.setUsername(username.value);
}

const roomIDInput = ref('');
const roomID = ref('');

function onRoomIDInput(e) {
	let str = e.target.value;
	roomIDInput.value = str;
}

const mode = ref('');

function onSelectArena() {
	attr.value.title.y = -20;
	attr.value.button_arena.y = -20;
	attr.value.username_input.y = 5;
	attr.value.room.y = 5;
	attr.value.log.x = 5;
	mode.value = 'arena';
}

function joinRoom() {
	room.joinRoom(mode.value, roomIDInput.value);
}

// export function onJoinRoom() {

// }

function createRoom() {
	room.createRoom(mode.value);
}

const logs = ref([{msg: "Log will be printed here.", color: ""}]);

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
		<Input @input="onUsernameInput" placeholder="Random Flower" maxlength="20"/>
	</Block>
	<Block :props="attr.log" style="width: 15%">
		<template v-for="log in logs">
			<Text size="1.5" :color="log.color" class="log">{{ log.msg }}</Text>
		</template>
	</Block>
	<Block :props="attr.room">
		<Text size="2">{{ `Room#${roomID}` }}</Text>
		<Input @input="onRoomIDInput" placeholder="RoomID" maxlength="6"/><br/>
		<Button @click="joinRoom">Join</Button><br>
		<Button @click="createRoom">Create</Button><br>
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
</style>