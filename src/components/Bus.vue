<template lang="pug">
div
  // Bus label and name
  v-menu(
    :close-on-content-click='false',
    :nudge-width='200',
    offset-x,
    v-model='customLabelFormOpen'
  )
    template(v-slot:activator='{ on, attrs }')
      div(v-bind='attrs', @dblclick='on.click', style='overflow:hidden;text-overflow:ellipsis')
        .primary--text(v-if='customLabel'): b {{ customLabel }}
        div(v-else) {{ bus.name }}
    v-card
      v-card-title.pt-2.pb-0 Custom label for bus
      v-card-text.py-0
        v-text-field(dense, v-model='form.customLabel', label='Label')
      v-card-actions
        v-btn(small, color='error', @click='customLabelFormOpen = false') Cancel
        v-btn(small, color='success', @click='setCustomLabel') Save label

  // Mute button and volume
  div
    v-icon.mr-3.red--text(v-show='bus.muted', small) fa-volume-mute
    small(v-show='bus.volume !== null', :class='bus.muted || bus.volume < 10 ? "red--text" : ""') {{ Math.round(bus.volume) }} %

  // Controls
  v-row(v-show='showAudioControls')
    .text-xs-center(v-show='bus.name !== "master"', style='margin: 10px -20px 0px 40px')
      div: v-btn(icon)
        v-icon(
          @click='toggleAudioBusOnOff',
          :color='bus.muted ? "red" : "green"',
          v-text='bus.muted ? "fa fa-volume-mute" : bus.volume < 10 ? "fa fa-volume-down" : "fa fa-volume-up"'
        )
      //- div.mt-2
        v-divider.mb-4
        div(style="margin-bottom: -10px"): v-btn(small @click="setMaxLimit") Max
        div.my-2: small Limits
        div(style="margin-top: -10px"): v-btn(small @click="setMinLimit") Min
    v-slider.bus-slider(
      vertical,
      v-model='bus.volumeBar',
      :min='0',
      :max='100',
      :color='bus.name === "master" ? "grey lighten-1" : bus.muted ? "red" : ""',
      :track-color='bus.name === "master" ? "grey" : bus.muted ? "red" : ""',
      :readonly='bus.name === "master"',
      @input='updateVolume',
      style='width:40px'
    )
    //- inverse-label
    //- :label="`${bus.volume} %`"
    //- style="margin-left: -10px"
  div(style='height:25px')
    div(v-if='customLabel'): small.grey--text ({{ bus.name }})
</template>

<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { AudioUtility } from 'vmix-js-utils'

const THROTTLE_RATE = 100

@Component({})
export default class AudioBus extends Vue {
  @Prop(Object) readonly bus!: { abbr: string; volume: number; muted: boolean }

  customLabelFormOpen = false

  form = {
    customLabel: this.customLabel,
  }

  get customLabel() {
    if (!(this.bus.abbr in this.$store.state.customBusLabels)) {
      return
    }
    return this.$store.state.customBusLabels[this.bus.abbr]
  }

  get showAudioControls(): boolean {
    return this.$store.state.showAudioControls
  }

  async editLabel() {
    console.log('EDIT')
  }

  /**
   * Fire a toggle of audio bus
   */
  async toggleAudioBusOnOff() {
    const command = { Function: 'BusXAudio', Value: this.bus.abbr }

    this.bus.muted = !this.bus.muted

    // console.log('SENT TO VMIX', command)

    // @ts-ignore
    this.execVmixCommands(command)
  }

  updateVolume = _.throttle((volumeBar: number) => {
    // const volume = Number(AudioUtility.fromVolumeBar(volumeBar).volume()).toFixed(0)
    const command = { Function: `SetBus${this.bus.abbr}Volume`, Value: volumeBar }

    // console.log('SENT TO VMIX', command)

    // @ts-ignore
    this.execVmixCommands(command)
  }, THROTTLE_RATE)

  async setCustomLabel() {
    this.$store.dispatch('setCustomBusLabel', { bus: this.bus.abbr, label: this.form.customLabel })
    this.customLabelFormOpen = false
  }

  setMaxLimit() {}

  setMinLimit() {}
}
</script>

<style lang="sass">
.bus-slider .v-slider
  min-height: 120px
</style>
