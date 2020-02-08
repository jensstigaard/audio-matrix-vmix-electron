<template lang="pug">
v-row
	v-col
		v-btn(block rounded outlined large @click="$emit('exec', { Function: 'Merge' })") Merge
	v-col
		v-btn(block rounded outlined large @click="$emit('exec', { Function: 'Fade' })") Fade
	v-col
		v-btn(block rounded outlined large @click="$emit('exec', { Function: 'Cut' })") Cut
	v-col
		v-btn(block rounded outlined large @click="$emit('exec', { Function: 'QuickPlay' })") Quick Play
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>
