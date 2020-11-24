export default {
  /**
   * Set vMix connection host
   * @param state
   * @param newHost
   */
  setHost(state: any, newHost: string) {
    // console.log('New host set in store', newHost)
    state.vMixConnection.host = newHost
  },

  /**
   * Add host to previous vMix connection hosts
   * @param state
   * @param host
   */
  addHostToPreviousConnectedVmixHosts(state: any, host: string) {
    state.previousVmixConnectionHosts.push(host)
  },

  /**
   * Set show audio controls
   * @param state
   */
  setShowAudioControls(state: any, showAudioControls: boolean) {
    state.showAudioControls = showAudioControls
  },

  /**
   * Set show inputs without audio
   * @param state
   */
  setShowInputsWithoutAudio(state: any, value: boolean) {
    state.showInputsWithoutAudio = value
  },

  /**
   * Set show audio controls
   * @param state
   */
  setCustomBusLabel(state: any, { bus, label }: { bus: string; label: string }) {
    state.customBusLabels[bus] = label
  },

  /**
   * Set show audio controls
   * @param state
   */
  removeCustomBusLabel(state: any, bus: string) {
    delete state.customBusLabels[bus]
  },
}
