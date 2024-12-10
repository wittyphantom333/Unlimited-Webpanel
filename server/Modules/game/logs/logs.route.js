import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { getLogFileData, getPlayerLogs } from '../../../Logging/LogReader'
import { unlEnv } from '../../../globalData'
import * as RoleService from '../../web/role/role.service'
import { UnlLogger } from '../../../Logging/UnlLogger'

export const logRouter = new router({ prefix: '/logs' })

logRouter.post(
  '/',
  checkPermission(ACTION.GAME.LOGS.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { type, fromline } = ctx.request.body

      if (unlEnv.loggerPaths[type] === undefined) {
        ctx.body = {
          resCode: false,
          logs: 'Unknown log type.',
        }
        ctx.status = 500
        return
      }

      const hasRolePerm = await RoleService.hasRolePermission(
        ctx.session.auth.user.roleId,
        unlEnv.loggerPerms[type],
        RESOURCE.GAME
      )

      if (hasRolePerm || ctx.session.auth.user.isMaster) {
        const logs = await getLogFileData(type, fromline)

        ctx.body = {
          resCode: true,
          logs: logs,
        }
        ctx.status = 200
        return
      }

      ctx.throw(403, 'Permission denied')
    } catch (e) {
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

logRouter.post(
  '/:citizenid',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const citizenid = ctx.params.citizenid
      const { fromline } = ctx.request.body

      const logs = await getPlayerLogs(citizenid, fromline)

      ctx.body = {
        resCode: true,
        logs: logs,
      }
      ctx.status = 200
    } catch (e) {
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default logRouter
