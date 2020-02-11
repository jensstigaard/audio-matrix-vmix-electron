import Vue from 'vue'
import Vuex from 'vuex'

// @ts-ignore - this is necessary since VS Code cannot find declarations of the types of vuex-electron
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    vMixConnection: {
      host: '127.0.0.1',
      debug: false
    },

    previewProgramRows: {
      // Swapped
      // false = Program on top
      // true = Preview on top
      swapped: false
    }
  },

  actions: {
    setHost({ commit }, newHost: string) {
      commit('setHost', newHost)
    },

    swapPreviewProgramRows({ commit }) {
      commit('swapPreviewProgramRows')
    }
  },

  mutations: {
    setHost(state, newHost: string) {
      state.vMixConnection.host = newHost
    },

    swapPreviewProgramRows(state) {
      state.previewProgramRows.swapped = !state.previewProgramRows.swapped
    }
  },

  modules: {},

  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== 'production'
})
