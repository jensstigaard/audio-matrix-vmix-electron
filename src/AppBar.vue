<template lang="pug">
v-app-bar(app color="primary" dark dense)
	div: b Audio Matrix for vMix
	v-spacer
	// Buttons
	//- v-btn(
	//- 	small
	//- 	@click="$store.dispatch('toggleShowAudioControls')"
	//- ) {{ showAudioControls ? 'Hide audio controls' : 'Show audio controls'}}
		
	//- v-btn(
	//- 	small
	//- 	@click="$store.dispatch('toggleShowInputsWithoutAudio')"
	//- 	v-text="showInputsWithoutAudio?'Hide inputs without audio':'Show inputs without audio'"
	//- )

	v-spacer
	// Hostname textfield
	v-combobox(
		v-model="host"
		label="vMix host"
		:items="previousHosts"
		@keyup.enter="changeHost"
		@blur="changeHost"
		:hide-selected="true"
		dense
	).mt-7
	v-icon#connection-status.ml-2.mt-2(
		small 
		:class="$vMixConnection.connected?'green--text':'red--text'" 
	) fa-circle
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch, Prop } from 'vue-property-decorator'

@Component({
  components: {},
})
export default class AppBar extends Vue {
  host: string = ''

  created() {
    this.host = this.$store.state.vMixConnection.host
  }

  /**
   * Change host in store state
   */
  changeHost() {
    const newHost = this.host

    if (newHost === this.$store.state.vMixConnection.host) {
      return
    }

    // console.log('Dispatched to store: setHost', newHost)

    this.$store.dispatch('setHost', newHost)
  }

  get showAudioControls(): boolean {
    return this.$store.state.showAudioControls
  }

  get previousHosts() {
    return JSON.parse(JSON.stringify(this.$store.state.previousVmixConnectionHosts))
      .reverse()
      .slice(0, 5)
  }
}
</script>
