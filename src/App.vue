<template lang="pug">
  v-app
    v-app-bar(app color="primary" dark)
      div: b Simple vMix switcher
      v-spacer
      v-text-field(v-model="host" label="vMix host" @keyup.enter="updateHost" @blur="updateHost").mt-8
      v-icon#connection-status.ml-2.mt-2(
        small 
        :class="connected?'green--text':'red--text'" 
      ) fa-circle

    v-content
      v-container(v-if="!connected") Not yet connected to vMix instance...
      v-container(fluid v-else)
        v-row#program-row(no-gutters)
          switcher-button(
            v-for="(input, i) in switcherInputs" :key="`program-row-input-${i}`"

            :number="i+1"
            :input="input"
            :on="input.program"
            on-color="red lighten-1"
            @click="program(i+1)"
          )

        hr.my-5

        v-row#preview-row(no-gutters)
          switcher-button(
            v-for="(input, i) in switcherInputs" :key="`preview-row-input-${i}`"

            :number="i+1"
            :input="input"
            :on="input.preview"
            on-color="green"
            @click="preview(i+1)"
          )
        
        hr.my-3
        
        action-buttons(@exec="execvMixCommand")
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { InputMapper, ApiDataParser } from 'vmix-js-utils'

import vMix, { ConnectionTCP } from 'node-vmix'

import ActionButtons from './ActionButtons.vue'
import SwitcherButton from './components/SwitcherButton.vue'

@Component({
  components: {
    ActionButtons,
    SwitcherButton
  }
})
export default class App extends Vue {
  host: string = ''

  // vMix connection
  vMixConn: ConnectionTCP | null = null

  inputs: any[] = []
  tallyInfo: any | null = null

  xmlDataInterval: any | null = null

  created() {
    this.host = this.$store.state.vMixConnection.host

    this.vMixConn = new vMix.ConnectionTCP(this.host)
  }

  @Watch('connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    console.log('Connected changed', isConnected)

    if (isConnected) {
      this.vMixConn!.send('SUBSCRIBE TALLY')

      this.vMixConn!.on('tally', (tallySummary: object) => {
        // console.log('Tally summary:', tallySummary)

        this.tallyInfo = tallySummary
      })

      // Request XML data each 5th second to update input titles
      this.vMixConn!.on('xmlData', (xmlRawData: string) => {
        // console.log('RAW', xmlRawData)

        const xmlContent = ApiDataParser.parse(xmlRawData)
        const inputs = Object.values(
          InputMapper.mapInputs(InputMapper.extractInputsFromXML(xmlContent), ['title'])
        )

        this.inputs = inputs
      })

      this.xmlDataInterval = setInterval(() => {
        this.vMixConn!.send('XML')
      }, 5000)
      this.vMixConn!.send('XML')
    } else {
      clearInterval(this.xmlDataInterval)
      this.xmlDataInterval = null
    }
  }

  @Watch('$store.state.vMixConnection.host')
  onHostChanged(val: string, oldval: string) {
    this.vMixConn = new vMix.ConnectionTCP(val, { debug: true })
  }

  get connected() {
    if (!this.vMixConn) {
      return false
    }

    return this.vMixConn!.connected()
  }

  get switcherInputs() {
    const inputs = JSON.parse(JSON.stringify(this.inputs.slice(0, 8))).map(
      (input: any, index: number) => {
        const number = index + 1

        input.preview = false
        input.program = false

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

    return inputs
  }

  preview(inputNumber: number) {
    this.execvMixCommand({ Function: 'PreviewInput', Input: inputNumber })
  }

  program(inputNumber: number) {
    this.execvMixCommand({ Function: 'CutDirect', Input: inputNumber })
  }

  execvMixCommand(command: any) {
    this.vMixConn!.send(command)
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
</style>
