<template lang="pug">
  v-app
    v-app-bar(app color="primary" dark)
      div: b Simple vMix switcher
      v-spacer
      v-text-field(v-model="host" label="vMix host" @keyup.enter="updateHost" @blur="updateHost").mt-8
      v-icon#connection-status.ml-2.mt-2(
        small 
        :class="$vMixConnection.connected?'green--text':'red--text'" 
      ) fa-circle

    v-content
      v-container(v-if="!$vMixConnection.connected")
        div.text-center
          v-icon(color="orange") fa-exclamation-circle
          div: b Not yet connected to vMix instance...
          div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
      v-container(fluid v-else)
        div(v-if="!switcherInputs.length") Ingen inputs fundet...
        div(v-else)
          // Preview and program rows
          div.d-flex(:class="$store.state.previewProgramRows.swapped?'flex-column':'flex-column-reverse'")
            program-row(:inputs="switcherInputs")
            hr.my-3
            preview-row(:inputs="switcherInputs")
          
          hr.my-3
          
          // Action buttons
          action-buttons
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { XmlInputMapper, XmlApiDataParser, XmlOverlayChannels } from 'vmix-js-utils'

import PreviewRow from './PreviewRow.vue'
import ProgramRow from './ProgramRow.vue'
import ActionButtons from './ActionButtons.vue'

@Component({
  components: {
    ActionButtons,
    PreviewRow,
    ProgramRow
  }
})
export default class App extends Vue {
  host: string = ''

  inputs: any[] = []
  tallyInfo: any | null = null
  overlayChannels: any | null = null

  xmlDataInterval: any | null = null

  created() {
    this.host = this.$store.state.vMixConnection.host

    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: true })
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    // console.log('Connected changed', isConnected)

    if (isConnected) {
      // @ts-ignore
      this.$vMixConnection!.send('SUBSCRIBE TALLY')

      // @ts-ignore
      this.$vMixConnection!.on('tally', (tallySummary: object) => {
        // console.log('Tally summary:', tallySummary)

        this.tallyInfo = tallySummary
      })

      // Request XML data each 5th second to update input titles
      // @ts-ignore
      this.$vMixConnection!.on('xmlData', (xmlRawData: string) => {
        // console.log('RAW', xmlRawData)

        const xmlContent = XmlApiDataParser.parse(xmlRawData)

        const inputs = Object.values(
          XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), ['title'])
        )

        const overlayChannels = XmlOverlayChannels.extract(xmlContent)

        this.inputs = inputs
        this.overlayChannels = overlayChannels
      })

      this.xmlDataInterval = setInterval(() => {
        // @ts-ignore
        this.$vMixConnection!.send('XML')
      }, 2000)
      // @ts-ignore
      this.$vMixConnection!.send('XML')
    } else {
      clearInterval(this.xmlDataInterval)
      this.xmlDataInterval = null
    }
  }

  @Watch('$store.state.vMixConnection.host')
  onHostChanged(val: string, oldval: string) {
    const newHost = val
    // @ts-ignore
    this.setVmixConnection(newHost, { debug: true })
  }

  get switcherInputs() {
    const inputs = JSON.parse(JSON.stringify(this.inputs.slice(0, 8))).map(
      (input: any, index: number) => {
        const number = index + 1

        input.preview = false
        input.program = false
        input.inOverlayChannelsPreview = []
        input.inOverlayChannelsProgram = []

        return input
      }
    )

    if (this.tallyInfo) {
      this.tallyInfo.program.forEach((inputInProgram: number) => {
        if (inputs.length >= inputInProgram) {
          inputs[inputInProgram - 1].program = true
        }
      })

      this.tallyInfo.preview.forEach((inputInPreview: number) => {
        if (inputs.length >= inputInPreview) {
          inputs[inputInPreview - 1].preview = true
        }
      })
    }

    // Parse overlay channels
    if (this.overlayChannels) {
      Object.entries(this.overlayChannels).forEach(([channelNumber, channel]) => {
        // console.log('Channel', channelNumber, ':', channel)

        // @ts-ignore
        if (channel.inputNumber && inputs.length >= channel.inputNumber) {
          // @ts-ignore
          if (channel.inPreview) {
            // @ts-ignore
            inputs[channel.inputNumber - 1].inOverlayChannelsPreview.push(channelNumber)
          } else {
            // @ts-ignore
            inputs[channel.inputNumber - 1].inOverlayChannelsProgram.push(channelNumber)
          }
        }
      })
    }

    return inputs
  }

  updateHost() {
    const newHost = this.host

    if (newHost === this.$store.state.vMixConnection.host) {
      return
    }

    this.$store.dispatch('setHost', newHost)
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

#connection-status
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5)


.rotated-header
  /* Rotate from top left corner (not default) */
  transform-origin: 0 0
  transform: rotate(90deg)
  letter-spacing: 2px
  text-transform: uppercase
  margin-left: 15px
  width: 22px
  padding: 0px
  font-weight: bold
</style>
