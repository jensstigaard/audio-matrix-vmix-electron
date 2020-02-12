<template lang="pug">
v-row.px-3
	v-col.px-1
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'Cut' })") Cut
	v-col.px-1
		v-btn(block rounded outlined large @click="execVmixCommands({ Function: 'QuickPlay' })") Quick Play
	v-divider.mx-2(
      inset
      vertical
	)
	v-col(v-for="(transition, index) in transitions" :key="`transitions-${index}`").px-1
		v-btn(block rounded outlined large @click="$emit('transition', { ...transition, number: index })")
			v-col(style="margin-top:-3px")
				div {{ transition.effect }}
				div(style="margin-top: -5px; font-weight: normal"): small {{ transition.duration }} ms
	v-tooltip(left)
		template(v-slot:activator="{ on }")
			v-btn(icon v-on="on" color="grey").mt-3: v-icon fa-question-circle
		span Transitions defined inside vMix
	//- v-col
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class TransitionButtons extends Vue {
  @Prop() readonly transitions!: { [key: number]: any }
}
</script>
