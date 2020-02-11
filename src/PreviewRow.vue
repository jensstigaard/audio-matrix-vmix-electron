<template lang="pug">
div
	v-row#preview-row(no-gutters)
		div.rotated-header Preview
		switcher-button(
			v-for="(input, i) in inputs" 
			:key="`preview-row-input-${i}`"
			:number="i+1"
			:input="input"
			:background-color="backgroundColor(input)"
			@click="preview(i+1)"
			@long-click="toggleOverlayChannelsPreview(input)"
		)
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import SwitcherButton from './components/SwitcherButton.vue'

const IN_PREVIEW_COLOR = 'green'
const IN_OVERLAY_PREVIEW_COLOR = 'orange lighten-3'

@Component({
  components: {
    SwitcherButton
  }
})
export default class PreviewRow extends Vue {
  @Prop() readonly inputs!: Object[]

  overlayChannelDialog: any = {
    input: null,
    // x: 0,
    // y: 0,
    show: false
  }

  backgroundColor(input: object) {
    // @ts-ignore
    if (input.inOverlayChannelsPreview.length) {
      return IN_OVERLAY_PREVIEW_COLOR
    }

    // Is in preview?
    // @ts-ignore
    if (input.preview) {
      return IN_PREVIEW_COLOR
    }

    // Default to 'default color'
    return ''
  }

  toggleOverlayChannelsPreview(input: any) {
    // const input = this.inputs[inputNumber - 1]

    // console.log('Input', input)

    const overlayChannels = input.inOverlayChannelsPreview

    if (!overlayChannels.length) {
      console.log('Popover for preview...')
      return
    }

    // console.log(
    //   'Toggle overlay channels for overlay channels in program for input',
    //   overlayChannels
    // )

    const commands = overlayChannels.map((channel: string) => ({
      Function: `OverlayInput${channel}Out`
    }))

    // @ts-ignore
    this.execVmixCommands(commands)
  }

  preview(inputNumber: number) {
    // @ts-ignore
    this.execVmixCommands({ Function: 'PreviewInput', Input: inputNumber })
  }
}
</script>
