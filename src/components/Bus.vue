<template lang="pug">
div

  div {{ bus.name }}
  div
    v-icon(v-show="bus.muted" small).mr-3.red--text fa-volume-mute
    small(v-show="bus.volume !== null" :class="bus.muted||bus.volume<10?'red--text':''") {{ Math.round(bus.volume) }} %

  v-row(v-show="showAudioControls")
    div(v-show="bus.name !== 'master'"
      style="width:80px;margin: 10px -30px 0px 20px"
    ).text-xs-center
      div: v-btn(icon)
        v-icon(
          @click="toggleAudioBusOnOff" 
          :color="bus.muted ? 'red' : 'green'"
          v-text="bus.muted ? 'fa fa-volume-mute' : bus.volume<10?'fa fa-volume-down':'fa fa-volume-up'"
        )
      //- div.mt-2
        v-divider.mb-4
        div(style="margin-bottom: -10px"): v-btn(small @click="setMaxLimit") Max
        div.my-2: small Limits
        div(style="margin-top: -10px"): v-btn(small @click="setMinLimit") Min
    v-slider(
      vertical
      v-model="bus.volumeBar"
      :min="0"
      :max="100"
      :color="bus.name==='master'?'grey lighten-1':bus.muted?'red':''"
      :track-color="bus.name==='master'?'grey':bus.muted?'red':''"
      
      :readonly="bus.name==='master'"
      @start="volumeControlPressed=true"
      @end="volumeControlPressed=false"
    )
    //- inverse-label
    //- :label="`${bus.volume} %`"
    //- style="margin-left: -10px"
</template>

<script lang="ts">
import _ from 'lodash'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { AudioUtility } from 'vmix-js-utils'

const THROTTLE_RATE = 150

@Component({})
export default class AudioBus extends Vue {
  @Prop(Object) readonly bus!: { abbr: string; volume: number; muted: boolean }

  volumeControlPressed: boolean = false

  @Watch('bus.volumeBar')
  onVolumeChanged(val: number, oldval: number) {
    // console.log('Volume changed', val)

    // Only send commands to vMix if actually pressed in interface
    if (this.volumeControlPressed) {
      this.updateVolume(val)
    }
  }

  get showAudioControls(): boolean {
    return this.$store.state.showAudioControls
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

  setMaxLimit() {}

  setMinLimit() {}
}
</script>
