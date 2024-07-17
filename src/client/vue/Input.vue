<script setup>
// import { ref } from 'vue';
defineProps(["placeholder"])
</script>
<template>
	<input
		class="input"
		:placeholder="placeholder">
</template>
<style>
.input {
	transform:translate(-50%, -50%);
}
</style>