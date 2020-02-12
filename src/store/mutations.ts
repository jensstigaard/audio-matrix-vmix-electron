export default {
  /**
   * Set vMix connection host
   * @param state
   * @param newHost
   */
  setHost(state: any, newHost: string) {
    state.vMixConnection.host = newHost
  },

  /**
   * Swap preview and program rows
   * @param state
   */
  swapPreviewProgramRows(state: any) {
    state.previewProgramRows.swapped = !state.previewProgramRows.swapped
  },

  /**
   * Add host to previous vMix connection hosts
   * @param state
   * @param host
   */
  addHostToPreviousConnectedVmixHosts(state: any, host: string) {
    state.previousVmixConnectionHosts.push(host)
  }
}
