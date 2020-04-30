<template lang="pug">
tr
  td 
    div(:class="!hasAudioBusses||!input.audiobusses.length||input.muted==='True'?'grey--text':''") 
      v-btn.mx-2(icon v-show="isInputMuted"): v-icon(small).red--text fa-volume-mute
      span {{ input.title }}
  td
    small(v-if="input.hasOwnProperty('volume')") {{ Math.round(input.volume) }} %
    small(v-else) &mdash;
  td(
    v-for="bus in audioBusses"
  )
    v-btn(
      v-if="hasAudioBusses"
      block
      @click="toggleAudioBus(bus, input)"
      :color="input.audiobusses.includes(bus.abbr) ? 'green lighten-1' : 'grey lighten-2'"
    ).elevation-0
      //- span {{ input.audiobusses && input.audiobusses.includes(bus.abbr) ? 'ON' : '' }}
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
  @Prop(Object) readonly input!: Object
  @Prop(Object) readonly audioBusses!: Object
  @Prop(Number) readonly number!: Number

  // For registering long presses
  currentPress: { [key: string]: any } = {
    isLongPress: false
  }

  get isInputMuted(): boolean {
    // @ts-ignore
    return this.input.muted === 'True'
  }

  get hasAudioBusses(): boolean {
    return this.input.hasOwnProperty('audiobusses')
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
  async toggleAudioBus(
    bus: { bus: string; abbr: string },
    input: { key: string; title: string; audiobusses: string }
  ) {
    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioBus', Input: input.key, Value: bus.abbr })

    // Toggle manually state for input - until xml interval picks up
    if (input.audiobusses.includes(bus.abbr)) {
      input.audiobusses = input.audiobusses.replace(bus.abbr, '')
    } else {
      input.audiobusses += `,${bus.abbr}`
    }
  }
}
</script>
