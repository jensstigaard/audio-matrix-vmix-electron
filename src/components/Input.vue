<template lang="pug">
tr
  td 
    div(:class="inputTitleClass") 
      v-icon(small v-show="isInputPlaying").blue--text.mx-2.mb-1 fa-play
        v-btn.mx-2(icon v-show="isInputMuted" @click="unmuteInput"): v-icon(small).red--text fa-volume-mute
      span {{ input.title }}
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
    v-btn(
      v-if="hasAudioBusses"
      block
      @click="toggleAudioBus(bus)"
      :color="input.audiobusses.includes(bus.abbr) ? 'green lighten-1' : 'grey lighten-2'"
    ).elevation-0
      v-icon.green--text.text--darken-3(v-if="input.audiobusses.includes(bus.abbr)") fa fa-fw fa-check
      v-icon(v-else) fa fa-fw fa-times
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

// @ts-ignore
import LongPress from 'vue-directive-long-press'

@Component({
  directives: {
    'long-press': LongPress
  }
})
export default class VmixInput extends Vue {
  @Prop(Object) readonly input!: any
  @Prop(Object) readonly audioBusses!: Object
  @Prop(Number) readonly number!: Number

  // For registering long presses
  currentPress: { [key: string]: any } = {
    isLongPress: false
  }

  get isInputPlaying(): boolean {
    // @ts-ignore
    return this.input.state === 'Running'
  }

  get isInputMuted(): boolean {
    return this.input.muted === 'True'
  }

  get hasAudioBusses(): boolean {
    return this.input.hasOwnProperty('audiobusses')
  }

  get inputTitleClass(): string {
    return !this.hasAudioBusses || !this.input.audiobusses.length || this.input.muted === 'True'
      ? 'grey--text'
      : ''
  }

  onLongPressStart() {
    // triggers after 300ms of mousedown
    console.log('Long Press detected... waiting for mouse up')
    this.currentPress.isLongPress = true
  }

  onLongPressStop(event: Event) {
    // triggers on mouseup of document

    if (this.currentPress.isLongPress) {
      // console.log('Mouse up was long click')
      this.$emit('long-click')
    } else {
      // console.log('Mouse up was short click')
      this.$emit('click')
    }

    // Reset current press infoƒ
    this.currentPress.isLongPress = false
  }

  /**
   * Fire a toggle of audio bus
   */
  async toggleAudioBus(bus: { bus: string; abbr: string }) {
    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioBus', Input: this.input.key, Value: bus.abbr })

    // Toggle manually state for input - until xml interval picks up
    if (this.input.audiobusses.includes(bus.abbr)) {
      this.input.audiobusses = this.input.audiobusses.replace(bus.abbr, '')
    } else {
      this.input.audiobusses += `,${bus.abbr}`
    }
  }

  /**
   * Fire a toggle of audio bus
   */
  async unmuteInput() {
    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioOn', Input: this.input.key })

    // Toggle manually muted state for input - until xml interval picks up
    if (this.input.muted === 'True') {
      this.input.muted = 'False'
    } else {
      this.input.muted = 'True'
    }
  }
}
</script>
