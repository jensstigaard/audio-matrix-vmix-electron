<template lang="pug">
	v-col.ma-1
		v-btn(
			block
			:color="on ? onColor : ''"
			style="height:80px"
			@click="$emit('click')"
		).px-0
			v-col
				div: big {{ number }}
				div(style="font-size: 7pt") {{ input.title }}
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    number: Number,
    input: Object,
    on: Boolean,
    onColor: String
  }
})
</script>
