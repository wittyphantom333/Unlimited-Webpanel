import ability from '@libs/acl/ability'
import pinia from '@stores/store'
import { useUserStore } from '@stores/user'

const userStore = useUserStore(pinia)

export const resolveVerticalNavMenuItemComponent = item => {
  if (item.header) return 'vertical-nav-menu-header'
  if (item.children) return 'vertical-nav-menu-group'
  return 'vertical-nav-menu-link'
}

export const can = (action, resource) => {
  return ability.can
    ? ability.can(action, resource) || userStore.IS_MASTER_USER
    : true
}

export const canViewVerticalNavMenuLink = item =>
  can(item.action, item.resource)

export const canViewVerticalNavMenuGroup = item => {
  const hasAnyVisibleChild = item.children.some(i => can(i.action, i.resource))

  if (!(item.action && item.resource)) {
    return hasAnyVisibleChild
  }
  return can(item.action, item.resource) && hasAnyVisibleChild
}

export const canViewVerticalNavMenuHeader = item => {
  return item.children.some(i => can(i.action, i.resource))
}
