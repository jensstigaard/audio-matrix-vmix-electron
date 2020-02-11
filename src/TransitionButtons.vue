<template lang="pug">
v-row
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'Cut' })") Cut
	v-col(v-for="(transition, index) in transitions" :key="`transitions-${index}`")
		v-btn(block rounded outlined large @click="$emit('transition', { ...transition, number: index })")
			span {{ transition.effect }}
	v-col
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'QuickPlay' })") Quick Play
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class TransitionButtons extends Vue {
  @Prop() readonly transitions!: { [key: number]: any }
}
</script>
