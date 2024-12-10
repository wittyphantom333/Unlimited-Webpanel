import { defineStore } from 'pinia'
import ability from '../@core/libs/acl/ability'
import { initialAbility } from '../@core/libs/acl/config'
import { ACTION, RESOURCE } from '../../../common/permissions'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      accessToken: null,
      userData: null,
    }
  },
  getters: {
    IS_MASTER_USER(state) {
      return state.userData?.isMaster
    },
  },
  actions: {
    UPDATE_ACCESS_TOKEN(val) {
      this.accessToken = val
    },
    UPDATE_USER_DATA(val) {
      this.userData = val

      // add basic ability
      if (val && val.ability) {
        val.ability.push(
          {
            action: ACTION.GENERAL.AUTH,
            subject: RESOURCE.GENERAL,
          },
          { action: ACTION.APP.DASHBOARD, subject: RESOURCE.APP }
        )
      }

      // update ability
      ability.update(val && val.ability ? val.ability : initialAbility)
    },
  },
})
