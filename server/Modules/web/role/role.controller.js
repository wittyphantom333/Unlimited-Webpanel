import * as RoleService from './role.service'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { ACTION, RESOURCE } from '../../../../common/permissions'

export const checkPermission = (permAction, permResource) =>
  async function (ctx, next) {
    try {
      const hasRolePerm = await RoleService.hasRolePermission(
        ctx.session.auth.user.roleId,
        permAction,
        permResource
      )

      if (
        hasRolePerm ||
        ctx.session.auth.user.isMaster ||
        (ctx.session.auth.user &&
          permAction === ACTION.APP.DASHBOARD &&
          permResource === RESOURCE.APP)
      ) {
        return next()
      }
    } catch (e) {
      ctx.status = 500
    }

    UnlLogger.error(`${ctx.session.auth.user.name} permission denied.`)
    ctx.throw(403, 'Permission denied')
  }
