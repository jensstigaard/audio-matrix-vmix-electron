<template lang="pug">
v-app
  app-bar

  v-main
    v-container(v-if='!$vMixConnection.connected')
      .text-center
        v-icon(color='orange') fa-exclamation-circle
        div: b Not yet connected to vMix instance...
        div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
    v-container.px-0(fluid, v-else)
      div(v-if='!inputs.length') No inputs found...
      div(v-else)
        table#audio-matrix
          //- colgroup
          //-   col(span='3', style='width:50%')
          //-   col(:span='audioBusses.length', style='width:50%')
          thead
            tr
              th(style='width: 30%') Input
              th(style='width: 40px') #
              th(style='width: 100px'): small Vol
              th(style='width: 100px'): small Gain
              th(v-for='bus in audioBusses', style='width: 100px')
                vmix-audio-bus(:bus='bus')
          tbody
            vmix-input(
              v-for='input in inputs',
              v-if='input.hasOwnProperty("volume") || $store.state.showInputsWithoutAudio',
              :key='input.key',
              :audio-busses='audioBusses',
              :input='input'
            )

        //- hr.my-8

  v-footer.grey--text(padless, style='font-size: 10pt')
    v-col.text-center(cols='12')
      span Made by <b><a target="_blank" href="https://github.com/jensstigaard">Jens Stigaard</a></b>
      v-divider.mx-2(vertical)
      small Inspiration from:
      small
        | <a target="_blank" href="https://forums.vmix.com/posts/t21233-vMatrix-audio-routing">thsorensen1</a>
        | &amp;
        | <a href="https://github.com/Haavard15/vMixAudioMatrix" target="_blank">Håvard Njåstad</a>
  //- pre {{ inputs }}
</template>

<script lang="ts">
// Libraries
// Vue
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import _ from 'lodash'

// Vmix
import { AudioUtility, XmlAudio, XmlInputMapper, XmlApiDataParser } from 'vmix-js-utils'

// Types
import { AudioBus } from 'vmix-js-utils/dist/types/audio-bus'

// Components
import AppBar from './AppBar.vue'
import VmixAudioBus from './components/Bus.vue'
import VmixInput from './components/Input.vue'

// Constants
const FETCH_XML_DATA_INTERVAL: number = 500 // ms

@Component({
  components: {
    AppBar,
    VmixAudioBus,
    VmixInput,
  },
})
export default class App extends Vue {
  audioBusses: { [key: string]: any } = {}
  inputs: any[] = []

  tallyInfo: any | null = null

  xmlDataInterval: any | null = null

  created() {
    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: false })
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    // console.log('Connected changed', isConnected)

    // If not connected anymore - do not attempt to send requests for XML data
    if (!isConnected) {
      if (this.xmlDataInterval) {
        clearInterval(this.xmlDataInterval)
        this.xmlDataInterval = null
      }
      return
    }

    // Connected
    // Add address to previous known addresses
    this.$store.dispatch('addHostToPreviousConnectedVmixHosts')

    // Request XML data each 5th second to update input titles
    // @ts-ignore
    this.$vMixConnection!.on('xml', (xmlRawData: string) => {
      // console.log('XML RECEIVED', xmlRawData.length)

      const xmlContent = XmlApiDataParser.parse(xmlRawData)

      const inputs = Object.values(
        XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), [
          'audiobusses',
          'muted',
          'number',
          'state',
          'title',
          'volume',
          'gainDB',
        ])
      ).map((input: any, index: number) => {
        const number = index + 1
        return {
          ...input,
          number,
          preview: this.tallyInfo && this.tallyInfo.program.includes(number),
          program: this.tallyInfo && this.tallyInfo.preview.includes(number),
          // Volume - must be converted to percentage on volumebar scale from raw value
          volumeBar: AudioUtility.fromVolume(input.volume).volumeBar(),
        }
      })

      // console.log(inputs)
      // Parse audio busses
      const audioBusses: { [key: string]: AudioBus } = _.keyBy(
        Object.values(XmlAudio.all(xmlContent)).map((bus: AudioBus) => {
          return {
            ...bus,
            // Append volumeBar to audio busses
            volumeBar: AudioUtility.fromVolume(bus.volume).volumeBar(), // Percentage on volumebar scale
          }
        }),
        (bus: AudioBus) => bus.name
      )

      this.audioBusses = audioBusses
      this.inputs = inputs
    })

    // Interval to request XML state from vMix instance
    this.xmlDataInterval = setInterval(() => {
      // @ts-ignore
      this.$vMixConnection!.send('XML')
    }, FETCH_XML_DATA_INTERVAL)

    // @ts-ignore
    this.$vMixConnection!.send('XML')

    // @ts-ignore
    this.$vMixConnection!.send('SUBSCRIBE TALLY')
    // @ts-ignore
    this.$vMixConnection!.on('tally', (tallySummary: object) => {
      // console.log('Tally summary:', tallySummary)
      this.tallyInfo = tallySummary
    })
  }

  @Watch('$store.state.vMixConnection.host')
  onHostChanged(val: string, oldval: string) {
    const newHost = val

    // console.log('New host', newHost)

    // @ts-ignore
    this.setVmixConnection(newHost, { debug: false })
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

table#audio-matrix
  width: 100%
  table-layout: fixed

  thead tr th
    // Sticky table header
    // https://algoart.fr/articles/css-table-fixed-header
    position: sticky
    z-index: 2
    top: 50px
    background: rgba(255, 255, 255, 0.9)

  thead tr th, tbody tr td
    border-bottom: 1px solid #DDD

    &:first-child
      text-align: right
      padding-right: 5px

    &:not(:first-child)
      text-align: center

    &:not(:last-child)
      border-right: 1px solid #DDD

  tbody

#connection-status
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5)

.rotated-header
  // Rotate from top left corner (not default)
  transform-origin: 0 0
  transform: rotate(90deg)
  // letter-spacing: 2px
  text-transform: uppercase
  margin-top: 3px
  margin-left: 20px
  width: 10px
  padding: 0px
  font-weight: bold

// Font-awesome icon "heartbeat" animation
// Inspiration: https://codepen.io/Grilly86/pen/KMKZap
.fa-beat
  animation: fa-beat 1.5s ease infinite

@keyframes fa-beat
  0%
    transform: scale(1)
  20%
    transform: scale(1.25)
  35%
    transform: scale(1.25)
  90%
    transform: scale(1)
  90%
    transform: scale(1)
</style>
