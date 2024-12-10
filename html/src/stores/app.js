import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => {
    return {
      setupMode: false,
    }
  },
  getters: {},
  actions: {
    UPDATE_SETUP_MODE(val) {
      this.setupMode = val
    },
  },
})
