<template lang="pug">
v-col.ma-1
  v-btn(
    block
    :color="color"
    :outlined="currentPress.isLongPress"
    :style="style"
    v-long-press="500"
    @long-press-start="onLongPressStart"
    @long-press-stop="onLongPressStop"
  ).px-0
    v-col
      v-badge(
        v-if="input && input.inOverlayChannelsPreview.length"
        :content="input.inOverlayChannelsPreview.join(',')"
        color="orange darken-2"
        left
        offset-x="-20"
        offset-y="-8"
      )
        big {{ number }}
      v-badge(
        v-else-if="input && input.inOverlayChannelsProgram.length"
        :content="input.inOverlayChannelsProgram.join(',')"
        color="blue lighten-1"
        offset-x="-20"
        offset-y="-8"
      )
        big {{ number }}
      div(v-else): big {{ number }}
      div(style="font-size: 7pt") {{ input.title }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

// @ts-ignore
import LongPress from 'vue-directive-long-press'

@Component({
  directives: {
    'long-press': LongPress
  }
})
export default class SwitcherButton extends Vue {
  @Prop(Object) readonly input!: Object
  @Prop(Number) readonly number!: Number
  @Prop(String) readonly backgroundColor!: String

  // For registering long presses
  currentPress: { [key: string]: any } = {
    isLongPress: false
  }

  get style() {
    const styles: { [key: string]: string } = {
      height: '80px'
    }

    // @ts-ignore
    if (this.input.inOverlayChannelsProgram.length && this.on) {
      styles['background-image'] = 'linear-gradient(to right, #e34646, #4d9efb)'
    }

    return styles
  }

  get color() {
    return this.backgroundColor
  }

  onLongPressStart() {
    // triggers after 300ms of mousedown
    console.log('Long Press detected... waiting for mouse up')
    this.currentPress.isLongPress = true
  }

  onLongPressStop(event: Event) {
    // triggers on mouseup of document

    if (this.currentPress.isLongPress) {
      // console.log('Mouse up was long click')
      this.$emit('long-click')
    } else {
      // console.log('Mouse up was short click')
      this.$emit('click')
    }

    // Reset current press infoƒ
    this.currentPress.isLongPress = false
  }
}
</script>
