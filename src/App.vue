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
        div(v-if="!switcherInputs.length") No inputs found...
        div(v-else)
          // Preview and program rows
          div.d-flex(:class="$store.state.previewProgramRows.swapped?'flex-column':'flex-column-reverse'")
            // Program row
            program-row(:inputs="switcherInputs" :total-number-of-inputs="inputs.length")
            // Transition progress line
            v-progress-linear(:value="transitionProgress" height="3").mt-5.mb-3
            // Preview row
            preview-row(:inputs="switcherInputs" :total-number-of-inputs="inputs.length")
          
          hr.my-3
          
          // Transition buttons
          transition-buttons(:transitions="transitions" @transition="transition")
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { XmlInputMapper, XmlApiDataParser, XmlOverlayChannels, XmlTransitions } from 'vmix-js-utils'

import AppBar from './AppBar.vue'
import PreviewRow from './PreviewRow.vue'
import ProgramRow from './ProgramRow.vue'
import TransitionButtons from './TransitionButtons.vue'

const FETCH_XML_DATA_INTERVAL: number = 2000 // ms
const TRANSITION_STEP: number = 100 // ms

const LIMIT_NUMBER_OF_INPUTS: number = 8

const sleep = (m: number) => new Promise(r => setTimeout(r, m))

@Component({
  components: {
    AppBar,
    TransitionButtons,
    PreviewRow,
    ProgramRow
  }
})
export default class App extends Vue {
  inputs: any[] = []
  tallyInfo: any | null = null
  overlayChannels: { [key: number]: any } | null = null
  transitions: { [key: number]: any } | null = null

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

    // @ts-ignore
    this.$vMixConnection!.send('SUBSCRIBE TALLY')

    // @ts-ignore
    this.$vMixConnection!.on('tally', (tallySummary: object) => {
      // console.log('Tally summary:', tallySummary)

      this.tallyInfo = tallySummary
    })

    // Request XML data each 5th second to update input titles
    // @ts-ignore
    this.$vMixConnection!.on('xml', (xmlRawData: string) => {
      // console.log('RAW', xmlRawData)

      const xmlContent = XmlApiDataParser.parse(xmlRawData)

      const inputs = Object.values(
        XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), ['title'])
      )

      const overlayChannels = XmlOverlayChannels.extract(xmlContent)
      const transitions = XmlTransitions.extract(xmlContent)

      this.inputs = inputs
      this.overlayChannels = overlayChannels
      this.transitions = transitions
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

  get switcherInputs() {
    const inputs = JSON.parse(JSON.stringify(this.inputs.slice(0, LIMIT_NUMBER_OF_INPUTS))).map(
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

  /**
   * Fire a Transition and show progress
   */
  async transition(transition: { duration: number; effect: string; number: number }) {
    // @ts-ignore
    this.execVmixCommands({ Function: `Transition${transition.number}` })
    this.transitionProgress = 0

    const duration: number = transition.duration

    const remainder: number = TRANSITION_STEP - (duration % TRANSITION_STEP)
    const numberOfSteps: number = Math.ceil(duration / TRANSITION_STEP)

    for (let i = 0; numberOfSteps > i; i++) {
      const stepsize = i === numberOfSteps - 1 ? remainder : TRANSITION_STEP

      await sleep(stepsize)
      const percentage: number =
        ((i === numberOfSteps - 1 ? i * TRANSITION_STEP + remainder : i * TRANSITION_STEP) /
          duration) *
        100
      // console.log('Set transition progress', percentage)
      this.transitionProgress = percentage
    }

    // Reset transition progress
    await sleep(1000)
    this.transitionProgress = 0
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
  // letter-spacing: 2px
  text-transform: uppercase
  margin-top: 3px
  margin-left: 20px
  width: 10px
  padding: 0px
  font-weight: bold
</style>
