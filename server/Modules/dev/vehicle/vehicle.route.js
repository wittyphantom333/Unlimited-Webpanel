import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { Game } from '../../../index'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { devLogger } from '../../../Logging/Modules/DevLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'

export const devVehicleRouter = new router({ prefix: '/dev-vehicles' })

devVehicleRouter.get(
  '/',
  checkPermission(ACTION.DEV.VEHICLE.READ, RESOURCE.DEV),
  async ctx => {
    try {
      // toDo: implement side fetching e.g. 25 per request etc
      const vehicles = Game.getVehicles()

      ctx.body = {
        vehicles: vehicles,
      }
      ctx.status = 200
    } catch (e) {
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

devVehicleRouter.get(
  '/:id',
  checkPermission(ACTION.DEV.VEHICLE.READ, RESOURCE.DEV),
  ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested shared vehicle ${ctx.params.id}.`
    )
    try {
      const vehId = ctx.params.id
      const vehicle = Game.getVehicle(vehId)

      ctx.body = {
        vehicle: vehicle,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

devVehicleRouter.patch(
  '/save/:id',
  checkPermission(ACTION.DEV.VEHICLE.MODIFY, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested save shared vehicle ${ctx.params.id}.`
    )
    try {
      const vehId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await Game.updateVehicle(vehId, data)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully saved shared vehicle ${vehId}.`
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

devVehicleRouter.post(
  '/create',
  checkPermission(ACTION.DEV.VEHICLE.CREATE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested create shared vehicle ${ctx.request.body.model}.`
    )
    try {
      const veh = ctx.request.body
      const { resCode, resMsg } = await Game.addVehicle(veh.model, veh)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully created shared vehicle ${veh.model}.`
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

devVehicleRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.DEV.VEHICLE.DELETE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested delete shared vehicle ${ctx.params.id}.`
    )
    try {
      const vehId = ctx.params.id
      const { resCode, resMsg } = await Game.deleteVehicle(vehId)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully deleted shared vehicle ${vehId}.`
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

export default devVehicleRouter
