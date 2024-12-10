import ability from './ability'
import pinia from '../../../stores/store'
import { useUserStore } from '../../../stores/user'

const userStore = useUserStore(pinia)

export const canNavigate = to =>
  ability.can(to.meta.action, to.meta.resource) || userStore.IS_MASTER_USER

export const _ = undefined
