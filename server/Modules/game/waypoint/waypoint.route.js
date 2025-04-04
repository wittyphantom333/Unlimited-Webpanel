import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { gameLogger } from '../../../Logging/Modules/GameLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import * as WaypointService from '../../game/waypoint/waypoint.service'

export const waypointRouter = new router({ prefix: '/waypoints' })

waypointRouter.get(
  '/',
  checkPermission(ACTION.GAME.WAYPOINT.READ, RESOURCE.GAME),
  async ctx => {
    gameLogger.info(`${ctx.session.auth.user.name} requested all waypoints.`)
    try {
      const waypoints = await WaypointService.getWaypoints()

      ctx.body = { waypoints: waypoints }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

waypointRouter.get(
  '/:id',
  checkPermission(ACTION.GAME.WAYPOINT.READ, RESOURCE.GAME),
  async ctx => {
    gameLogger.info(
      `${ctx.session.auth.user.name} requested waypoint ${ctx.params.id}.`
    )
    try {
      const waypointId = ctx.params.id
      const waypoint = await WaypointService.getWaypoint(waypointId)

      ctx.body = { waypoint: waypoint }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

waypointRouter.patch(
  '/save/:id',
  checkPermission(ACTION.GAME.WAYPOINT.MODIFY, RESOURCE.GAME),
  async ctx => {
    gameLogger.info(
      `${ctx.session.auth.user.name} requested save waypoint ${ctx.params.id}.`
    )
    try {
      const waypointId = ctx.params.id
      const { label, coords } = ctx.request.body
      const { resCode, resMsg } = await WaypointService.updateWaypoint(
        waypointId,
        label,
        coords
      )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

waypointRouter.post(
  '/create',
  checkPermission(ACTION.GAME.WAYPOINT.CREATE, RESOURCE.GAME),
  async ctx => {
    gameLogger.info(
      `${ctx.session.auth.user.name} requested create waypoint ${ctx.request.body.name}.`
    )
    try {
      const { name, label, coords } = ctx.request.body
      const { resCode, resMsg } = await WaypointService.createWaypoint(
        name,
        label,
        coords
      )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

waypointRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.GAME.WAYPOINT.DELETE, RESOURCE.GAME),
  async ctx => {
    gameLogger.info(
      `${ctx.session.auth.user.name} requested delete waypoint ${ctx.params.id}.`
    )
    try {
      const waypointId = ctx.params.id
      const { resCode, resMsg } = await WaypointService.deleteWaypoint(
        waypointId
      )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default waypointRouter
