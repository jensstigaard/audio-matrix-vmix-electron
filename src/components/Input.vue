<template lang="pug">
tr
  td(style="overflow:hidden;text-overflow:ellipsis")
    div(:class="inputTitleClass") 
      v-icon(
        small
        v-show="['Video', 'VideoList', 'AudioFile'].includes(input.type)"
        :class="playingIconClass"
        v-text="playingIconText"
      ).mr-5.mb-1
      
      v-tooltip(v-if="$store.state.showAudioControls && isInputMuted" top)
        template(v-slot:activator="{ on }")
          v-btn.mx-2(
            icon
            v-on="on"
            @click="unmuteInput"
          ): v-icon(small).red--text fa-volume-mute
        span Unmute input
      v-btn.mx-2(
        icon
        disabled
        v-else-if="isInputMuted"
      ): v-icon(small).red--text fa-volume-mute

      span(style="white-space:nowrap") {{ input.title }}
  td: b {{ input.number }}
  td
    small(v-if="input.hasOwnProperty('volume')") {{ Math.round(input.volume) }} %
    small(v-else).grey--text &mdash;
  td(
    v-if="!hasAudioBusses"
    :colspan="Object.values(audioBusses).length"
    style="text-align:center"
  ).grey--text &mdash;
  td(
    v-else
    v-for="bus in audioBusses"
  )
    //- style="vertical-align:top"
    input-bus-button(:input="input" :bus="bus")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { AudioBus } from 'vmix-js-utils/dist/types/audio-bus'
import InputBusButton from './InputBusButton.vue'

@Component({
  components: {
    InputBusButton
  }
})
export default class VmixInput extends Vue {
  @Prop(Object) readonly input!: any
  @Prop(Object) readonly audioBusses!: Object
  @Prop(Number) readonly number!: Number

  get isInputPlaying(): boolean {
    // @ts-ignore
    return this.input.state === 'Running'
  }

  get isInputMuted(): boolean {
    return this.input.muted === 'True'
  }

  get isInputActive(): boolean {
    return this.isInputPlaying && !this.isInputMuted
  }

  get isOnAir(): boolean {
    return this.input.audiobusses && this.input.audiobusses.includes('M')
  }

  get isInputActiveOnAir(): boolean {
    return this.isInputActive && this.isOnAir
  }

  get hasAudioBusses(): boolean {
    return this.input.hasOwnProperty('audiobusses')
  }

  get playingIconText(): string {
    if (this.isOnAir) {
      return 'fa-circle'
    }

    if (this.isInputPlaying) {
      return 'fa-play'
    }

    return 'fa-pause'
  }

  get playingIconClass() {
    if (this.isInputActiveOnAir) {
      return 'red--text fa-beat'
    }

    if (this.isOnAir && this.isInputPlaying && this.isInputMuted) {
      return 'grey--text fa-beat'
    }

    if (this.input.program) {
      return 'red--text'
    }

    if (this.input.preview) {
      return 'green--text'
    }

    if (this.isInputActive) {
      return 'blue--text fa-beat'
    }

    return 'grey--text'
  }

  get inputTitleClass(): string {
    if (this.input.program) {
      return 'red--text font-weight-bold'
    }

    if (this.input.preview) {
      return 'green--text text--darken-1'
    }

    if (!this.hasAudioBusses || !this.input.audiobusses.length || this.input.muted === 'True') {
      return 'grey--text'
    }

    return ''
  }

  /**
   * Fire a toggle of audio bus
   */
  async unmuteInput() {
    // Toggle manually muted state for input - until xml interval picks up
    this.input.muted = 'False'

    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioOn', Input: this.input.key })
  }
}
</script>
