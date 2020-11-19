export default {
  /**
   * Set host
   *
   * @param param0
   * @param newHost
   */
  setHost({ commit }: any, newHost: any) {
    // console.log('Store Action: Received dispatched request: Set host', newHost)
    commit('setHost', newHost)
  },

  /**
   * Add host to previous connected vMix hosts
   *
   * @param param0
   */
  addHostToPreviousConnectedVmixHosts({ state, commit }: { commit: Function; state: any }) {
    const host: string = state.vMixConnection.host

    if (state.previousVmixConnectionHosts.includes(host)) {
      return
    }

    commit('addHostToPreviousConnectedVmixHosts', state.vMixConnection.host)
  },

  /**
   * Toggle show audio controls
   *
   * @param param0
   */
  toggleShowAudioControls({ state, commit }: { commit: Function; state: any }) {
    commit('setShowAudioControls', !state.showAudioControls)
  },
}
