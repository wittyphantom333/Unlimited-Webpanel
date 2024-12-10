import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import {
  deleteVehicle,
  getPartialDatabaseVehicles,
  getVehicle,
  getVehicleHandle,
  updateVehicleFieldData,
  updateVehicleOwnerData,
} from './vehicle.controller'
import {
  createPlayerVehicle,
  getDatabaseVehicleCount,
  getVehicleByPlate,
  repairVehicle,
  updateVehiclePlate,
} from './vehicle.service'
import { getPlayer } from '../player/player.service'

export const vehicleRouter = new router({ prefix: '/vehicles' })

vehicleRouter.post(
  '/',
  checkPermission(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all vehicles.`)
    try {
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const vehicles = await getPartialDatabaseVehicles(
        startRow,
        count,
        filter,
        sortBy,
        descending
      )

      ctx.body = {
        vehicles: vehicles,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.get(
  '/:id',
  checkPermission(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested vehicle with id ${ctx.params.id}.`
    )
    try {
      const id = ctx.params.id

      let vehicle = await getVehicle(id)

      const player = await getPlayer(vehicle.citizenid)
      if (player) {
        vehicle.ownerName = `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`
      }

      ctx.body = {
        resCode: !!vehicle,
        vehicle: vehicle,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/vehicle-count',
  checkPermission(ACTION.GAME.VEHICLE.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { filter } = ctx.request.body
      const data = await getDatabaseVehicleCount(filter)

      ctx.body = {
        count: data[0].count,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/changeOwner',
  checkPermission(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change vehicle owner for id ${ctx.request.body.id}.`
    )
    try {
      const data = ctx.request.body
      const player = await getPlayer(data.citizenid)

      if (!player) {
        return (ctx.body = {
          resCode: false,
          resMsg: 'invalid_citizenid',
        })
      }

      const success = await updateVehicleOwnerData(
        data.id,
        player.PlayerData.citizenid,
        player.PlayerData.license
      )

      ctx.body = {
        resCode: success,
        resMsg: success ? 'success' : 'missingData',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/changePlate',
  checkPermission(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change vehicle plate for id ${ctx.request.body.id} (${ctx.request.body.plate}).`
    )
    try {
      const { id, plate, newPlate } = ctx.request.body

      const plates = await getVehicleByPlate(newPlate)

      if (plates.length > 0) {
        return (ctx.body = {
          resCode: false,
          resMsg: 'plate_exists',
        })
      }

      const { resCode, resMsg } = await updateVehiclePlate(
        id,
        plate,
        newPlate.toUpperCase()
      )

      if (resCode) {
        const vehHandle = getVehicleHandle(plate)

        if (vehHandle) {
          SetVehicleNumberPlateText(vehHandle, newPlate.toUpperCase())
        }
      }

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/updateField',
  checkPermission(ACTION.GAME.VEHICLE.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change vehicle ${ctx.request.body.field} with id ${ctx.request.body.id}.`
    )
    try {
      const data = ctx.request.body
      const success = await updateVehicleFieldData(
        data.id,
        data.field,
        data.value
      )

      const vehHandle = getVehicleHandle(data.plate)
      if (vehHandle && success) {
        const vehNetOwner = NetworkGetEntityOwner(vehHandle)

        if (
          vehNetOwner &&
          (data.field === 'fuel' ||
            data.field === 'body' ||
            data.field === 'engine')
        ) {
          TriggerClientEvent(
            `unlWeb:vehicle:${data.field}`,
            vehNetOwner,
            data.plate,
            data.value
          )
        }
      }

      ctx.body = {
        resCode: success,
        resMsg: success ? 'success' : 'not_found',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/repair',
  checkPermission(ACTION.GAME.VEHICLE.REPAIR, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested vehicle repair for id ${ctx.request.body.id}.`
    )
    try {
      const data = ctx.request.body
      const vehHandle = getVehicleHandle(data.plate)

      const success = await repairVehicle(data.id)

      if (vehHandle) {
        const vehNetOwner = NetworkGetEntityOwner(vehHandle)

        if (vehNetOwner)
          TriggerClientEvent('unlWeb:vehicle:repair', vehNetOwner, data.plate)
      }

      ctx.body = {
        resCode: success,
        resMsg: success ? 'success' : 'not_found',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/despawn',
  checkPermission(ACTION.GAME.VEHICLE.DESPAWN, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested despawn vehicle with plate ${ctx.request.body.plate} id ${ctx.request.body.id}.`
    )
    try {
      const data = ctx.request.body
      const vehHandle = getVehicleHandle(data.plate)

      if (vehHandle) {
        if (GetResourceState('AdvancedParking') === 'started') {
          global.exports['AdvancedParking'].DeleteVehicle(vehHandle)
        } else {
          DeleteEntity(vehHandle)
        }
      }

      ctx.body = {
        resCode: !!vehHandle,
        resMsg: vehHandle ? 'success' : 'not_spawned',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/delete',
  checkPermission(ACTION.GAME.VEHICLE.DELETE, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete vehicle id ${ctx.request.body.id}.`
    )
    try {
      const data = ctx.request.body
      const success = deleteVehicle(data.id)
      const vehHandle = getVehicleHandle(data.plate)

      if (vehHandle && success) {
        if (GetResourceState('AdvancedParking') === 'started') {
          global.exports['AdvancedParking'].DeleteVehicle(vehHandle)
        } else {
          DeleteEntity(vehHandle)
        }
      }

      ctx.body = {
        resCode: success,
        resMsg: success ? null : 'not_found',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

vehicleRouter.post(
  '/create',
  checkPermission(ACTION.GAME.VEHICLE.CREATE, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested create vehicle.`)
    try {
      const { citizenid, vehicle } = ctx.request.body

      const player = await getPlayer(citizenid)
      if (!player) {
        return (ctx.body = {
          resCode: false,
          resMsg: 'invalid_citizenid',
        })
      }

      const plates = await getVehicleByPlate(vehicle.plate)
      if (plates.length > 0) {
        return (ctx.body = {
          resCode: false,
          resMsg: 'plate_exists',
        })
      }

      const { resCode, resMsg } = await createPlayerVehicle(player, vehicle)

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default vehicleRouter
