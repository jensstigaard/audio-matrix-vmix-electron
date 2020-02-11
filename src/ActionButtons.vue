<template lang="pug">
v-row
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'Cut' })") Cut
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'Merge' })") Merge
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'Fade' })") Fade
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'QuickPlay' })") Quick Play
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
