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
                th
                th(v-for="bus in audioBusses")
                  div {{ bus.name }}
                  small(v-show="bus.muted") MUTED
                  small(v-show="!bus.muted && bus.volume") {{ Math.round(bus.volume) }} %
            tbody
              tr(v-for="input in inputs")
                td 
                  span(:class="!input.audiobusses.length||input.muted==='True'?'grey--text':''") {{ input.title }}
                td(
                  v-for="bus in audioBusses"
                ) 
                  v-btn(
                    @click="toggleAudioBus(bus, input)"
                    :color="input.audiobusses && input.audiobusses.includes(bus.abbr) ? 'green lighten-1' : 'grey lighten-2'"
                  ).elevation-0
                    //- span {{ input.audiobusses && input.audiobusses.includes(bus.abbr) ? 'ON' : '' }}
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

import { XmlInputMapper, XmlApiDataParser, XmlOverlayChannels, XmlTransitions } from 'vmix-js-utils'

import xpath, { SelectedValue } from 'xpath'
import _ from 'lodash'

import AppBar from './AppBar.vue'

const FETCH_XML_DATA_INTERVAL: number = 2000 // ms
const TRANSITION_STEP: number = 100 // ms

const LIMIT_NUMBER_OF_INPUTS: number = 8

const sleep = (m: number) => new Promise(r => setTimeout(r, m))

function extractAudioBusses(xmlContent: Node): { [key: string]: any } {
  const audioBussesXml: Element[] = xpath.select('//vmix/audio/*', xmlContent) as Element[]

  // console.log(audioBussesXml)
  // return

  const audioBusses = audioBussesXml
    .map((entry: Element) => {
      if (!entry) {
        return
      }

      // Map all base attributes of input
      const name: string = entry.nodeName

      if (name !== 'master' && !name.startsWith('bus')) {
        return
      }

      const abbr = name === 'master' ? 'M' : name.replace('bus', '')

      const attributesList = Object.values(entry.attributes)

      const volumeAttr = attributesList.find((attr: Attr) => attr.name === 'volume')
      const mutedAttr = attributesList.find((attr: Attr) => attr.name === 'muted')

      // No attribute found
      if (!volumeAttr || !mutedAttr) {
        return
      }

      const volume: number = Number(volumeAttr.nodeValue)

      const muted: boolean = String(mutedAttr.nodeValue) === 'True'

      return { name, abbr, muted, volume }
    })
    .filter(x => x)

  return _.keyBy(audioBusses, (bus: { [key: string]: any }) => bus.name)
}

@Component({
  components: {
    AppBar
  }
})
export default class App extends Vue {
  inputs: any[] = []
  audioBusses: { [key: string]: any } = {}

  xmlDataInterval: any | null = null
  transitionProgress: number = 0

  created() {
    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: true })
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    // console.log('Connected changed', isConnected)

    // If not connected anymore - do not attempt to send requests for XML data
    if (!isConnected) {
      clearInterval(this.xmlDataInterval)
      this.xmlDataInterval = null
      return
    }

    // Connected
    // Add address to previous known addresses
    this.$store.dispatch('addHostToPreviousConnectedVmixHosts')

    // Request XML data each 5th second to update input titles
    // @ts-ignore
    this.$vMixConnection!.on('xml', (xmlRawData: string) => {
      // console.log('XML RECEIVED', xmlRawData)

      const xmlContent = XmlApiDataParser.parse(xmlRawData)

      const inputs = Object.values(
        XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), [
          'title',
          'muted',
          'audiobusses'
        ])
      )

      // console.log(inputs)
      const audioBusses = extractAudioBusses(xmlContent)

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
    // @ts-ignore
    this.setVmixConnection(newHost, { debug: true })
  }

  /**
   * Fire a toggle of audio bus
   */
  async toggleAudioBus(bus: { bus: string; abbr: string }, input: { key: string; title: string }) {
    // @ts-ignore
    this.execVmixCommands({ Function: 'AudioBus', Input: input.key, Value: bus.abbr })
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

table#audio-matrix
  width: 100%

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
</style>
