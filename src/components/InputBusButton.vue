<template lang="pug">
v-btn(
		block
		@click="toggleAudioBus"
		:color="inputBusBackground"
	).elevation-0
		v-icon(
			v-if="active"
			:class="inputBusIconClass"
		) fa fa-fw fa-check
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { AudioBus } from 'vmix-js-utils/dist/types/audio-bus'

@Component({})
export default class VmixInputBusButton extends Vue {
  @Prop(Object) readonly input!: { [key: string]: any }
  @Prop(Object) readonly bus!: AudioBus

  get active(): boolean {
    return this.input.audiobusses.includes(this.bus.abbr)
  }

  get inputBusBackground(): string {
    const hasAudioBus = this.input.audiobusses.includes(this.bus.abbr)

    if (this.input.program && this.bus.abbr === 'M') {
      return hasAudioBus ? 'red lighten-1' : 'red lighten-3'
    }
    if (this.input.preview && this.bus.abbr === 'M') {
      return hasAudioBus ? 'green' : 'green lighten-3'
    }

    return hasAudioBus ? 'primary lighten-1' : 'grey lighten-2'
  }

  get inputBusIconClass(): string {
    if (this.input.program) {
      return 'red--text text--darken-4'
    }

    if (this.input.preview) {
      return 'green--text text--darken-4'
    }

    return 'primary--text text--darken-2'
  }

  /**
   * Fire a toggle of audio this.bus
   */
  async toggleAudioBus() {
    // Toggle manually state for input - until xml interval picks up
    if (this.input.audiobusses.includes(this.bus.abbr)) {
      this.input.audiobusses = this.input.audiobusses.replace(this.bus.abbr, '')
    } else {
      this.input.audiobusses += `,${this.bus.abbr}`
    }

    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioBus', Input: this.input.key, Value: this.bus.abbr })
  }
}
</script>
