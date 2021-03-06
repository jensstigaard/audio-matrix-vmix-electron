<template lang="pug">
tr
  // Title cell
  td(style='overflow: hidden; text-overflow: ellipsis')
    div(:class='inputTitleClass') 
      v-icon.mr-5.mb-1(
        small,
        v-show='["Video", "VideoList", "AudioFile"].includes(input.type)',
        :class='playingIconClass',
        v-text='playingIconText'
      )

      v-tooltip(v-if='$store.state.showAudioControls && isInputMuted', top)
        template(v-slot:activator='{ on }')
          v-btn.mx-2(icon, v-on='on', @click='unmuteInput'): v-icon.red--text(small) fa-volume-mute
        span Unmute input
      v-btn.mx-2(icon, disabled, v-else-if='isInputMuted'): v-icon.red--text(small) fa-volume-mute

      span(style='white-space: nowrap') {{ input.title }}

  // Title number cell
  td: b {{ input.number }}

  // Volume cell
  td(v-if='input.hasOwnProperty("volume")')
    .text-center(v-if='!showAudioControls') {{ Math.round(input.volume) }} %
    v-row.ma-0.pa-0(v-else, dense)
      v-col.pa-0.pt-md-3(cols='12', md='4'): small {{ Math.round(input.volume) }} %
      v-col.pa-0(cols='12', md='8')
        v-slider.mt-3.mb-0(
          v-model='input.volumeBar',
          :min='0',
          :max='100',
          dense,
          color='primary',
          track-color='primary',
          @input='updateVolume'
        )
        //- :color='isInputMuted ? "grey lighten-1" : "primary"',
        //- :track-color='isInputMuted ? "grey" : "primary"',

  // In case no audiobusses could be passed - fill with blank cell
  td.grey--text(
    v-if='!hasAudioBusses',
    :colspan='Object.values(audioBusses).length + 1',
    style='text-align: center'
  ) &mdash;

  // Iterate through each audio bus
  td(v-else, v-for='bus in audioBusses')
    //- style="vertical-align:top"
    input-bus-button(:input='input', :bus='bus')
</template>

<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import InputBusButton from './InputBusButton.vue'

const THROTTLE_RATE = 100

@Component({
  components: {
    InputBusButton,
  },
})
export default class VmixInput extends Vue {
  @Prop(Object) readonly input!: any
  @Prop(Object) readonly audioBusses!: Object
  @Prop(Number) readonly number!: Number

  volumeControlPressed: boolean = false

  get showAudioControls(): boolean {
    return this.$store.state.showAudioControls
  }

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

  updateVolume = _.throttle((volumeBar: number) => {
    // const volume = Number(AudioUtility.fromVolumeBar(volumeBar).volume()).toFixed(0)
    const command = {
      Function: `SetVolume`,
      Input: this.input.number,
      Value: volumeBar,
    }

    // console.log('SENT TO VMIX', command)

    // @ts-ignore
    this.execVmixCommands(command)
  }, THROTTLE_RATE)
}
</script>
