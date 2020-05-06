<template lang="pug">
  v-app
    app-bar

    v-content
      v-container(v-if="!$vMixConnection.connected")
        div.text-center
          v-icon(color="orange") fa-exclamation-circle
          div: b Not yet connected to vMix instance...
          div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
      v-container(fluid v-else)
        div(v-if="!inputs.length") No inputs found...
        div(v-else)
          table#audio-matrix
            thead
              tr
                th(style="width:40%") Input
                th(style="width:40px") #
                th(style="width:80px"): small Vol %
                th(v-for="bus in audioBusses")
                  vmix-audio-bus(:bus="bus")
            tbody
              vmix-input(
                v-for="input in inputs"
                :key="input.key"
                :audio-busses="audioBusses"
                :input="input"
              )
          hr.my-8
          div.grey--text(style="text-align:center")
            div: small Inspiration from:
            div: small <a target="_blank" href="https://forums.vmix.com/posts/t21233-vMatrix-audio-routing">thsorensen1</a> &amp; <a href="https://github.com/Haavard15/vMixAudioMatrix" target="_blank">Håvard Njåstad</a>
          //- pre {{ inputs }}

</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import {
  AudioUtility,
  XmlAudio,
  XmlGeneralState,
  XmlInputMapper,
  XmlApiDataParser,
  XmlOverlayChannels,
  XmlTransitions
} from 'vmix-js-utils'

import xpath, { SelectedValue } from 'xpath'
import _ from 'lodash'

import AppBar from './AppBar.vue'
import VmixAudioBus from './components/Bus.vue'
import VmixInput from './components/Input.vue'
import { AudioBus } from 'vmix-js-utils/dist/types/audio-bus'

const FETCH_XML_DATA_INTERVAL: number = 500 // ms

const LIMIT_NUMBER_OF_INPUTS: number = 8

const sleep = (m: number) => new Promise(r => setTimeout(r, m))

@Component({
  components: {
    AppBar,
    VmixAudioBus,
    VmixInput
  }
})
export default class App extends Vue {
  inputs: any[] = []
  audioBusses: { [key: string]: any } = {}

  xmlDataInterval: any | null = null

  created() {
    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: true })
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    console.log('Connected changed', isConnected)

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
          'volume'
        ])
      )

      // console.log(inputs)
      const audioBusses: { [key: string]: AudioBus } = _.keyBy(
        Object.values(XmlAudio.all(xmlContent)).map((bus: AudioBus) => {
          return {
            ...bus,
            // Append volumeBar to audio busses
            volumeBar: AudioUtility.fromVolume(bus.volume).volumeBar() // Percentage on volumebar scale
          }
        }),
        (bus: AudioBus) => bus.name
      )

      this.inputs = inputs
      this.audioBusses = audioBusses
    })

    this.xmlDataInterval = setInterval(() => {
      // @ts-ignore
      this.$vMixConnection!.send('XML')
    }, FETCH_XML_DATA_INTERVAL)

    // @ts-ignore
    this.$vMixConnection!.send('XML')
  }

  @Watch('$store.state.vMixConnection.host')
  onHostChanged(val: string, oldval: string) {
    const newHost = val

    console.log('New host', newHost)

    // @ts-ignore
    this.setVmixConnection(newHost, { debug: true })
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

table#audio-matrix
  width: 100%
  table-layout: fixed

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
  animation: fa-beat 3s ease infinite

@keyframes fa-beat
  0%
    transform: scale(1)
  5%
    transform: scale(1.25)
  20%
    transform: scale(1)
  30%
    transform: scale(1)
  35%
    transform: scale(1.25)
  50%
    transform: scale(1)
  55%
    transform: scale(1.25)
  70%
    transform: scale(1)
</style>
