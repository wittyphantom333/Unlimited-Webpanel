import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { Database, Game } from '../../../index'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import {
  changePlayerAccount,
  getDatabasePlayersCount,
  getPartialDatabasePlayers,
  getPlayer,
  getPlayerScreen,
  handleHandCuffed,
  handleHealPlayer,
  handleIsDead,
  handlePlayerArmor,
  handlePlayerBan,
  isPlayerBanned,
  resetPlayerBan,
  teleportTo,
} from './player.service'
import { playerLogger } from '../../../Logging/Modules/PlayerLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { getPlayerVehicles } from '../vehicle/vehicle.controller'
import { unlEnv } from '../../../globalData'
import { banFile } from '../../../Logging/Modules/BanFile'
import { getPlayerBans } from '../../../Logging/LogReader'
import playerInventoryRouter from './inventory/inventory.route'
import { getPlayerDatabaseVehicleCount } from '../vehicle/vehicle.service'

export const playerRouter = new router({ prefix: '/players' })

playerRouter.use(
  playerInventoryRouter.routes(),
  playerInventoryRouter.allowedMethods()
)

playerRouter.post(
  '/',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all players.`)
    try {
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const players = await getPartialDatabasePlayers(
        startRow,
        count,
        filter,
        sortBy,
        descending
      )

      players.forEach(player => {
        player.online = !!Game.QBCore.Functions.GetPlayerByCitizenId(
          player.citizenid
        )
      })

      ctx.body = {
        players: players,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/player-count',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { filter } = ctx.request.body
      const data = await getDatabasePlayersCount(filter)

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
playerRouter.post(
  '/change-account',
  checkPermission(ACTION.GAME.PLAYER.LICENSE, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change account for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, license } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!citizenid || !license) {
        ctx.body = {
          resCode: false,
          resMsg: 'missingFields',
        }
        ctx.status = 200
        return
      }

      playerLogger.info(
        `[${citizenid}] ${ctx.session.auth.user.name} changed account to ${license}.`
      )

      if (player.PlayerData.source)
        DropPlayer(
          player.PlayerData.source,
          `Your character got transfered to an other account by ${ctx.session.auth.user.name}`
        )
      const resCode = await changePlayerAccount(citizenid, license)

      ctx.body = {
        resCode: resCode,
        resMsg: resCode ? '' : 'notFound',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.get(
  '/change-job',
  checkPermission(ACTION.GAME.PLAYER.JOB, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested change jobs.`)
    try {
      const jobs = Game.QBCore.Shared.Jobs

      ctx.body = {
        jobs: jobs,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/change-job',
  checkPermission(ACTION.GAME.PLAYER.JOB, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change job for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, name, grade } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)
      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      const resCode = player.Functions.SetJob(name, grade)
      if (resCode) player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed job to ${name} ${grade} for ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: resCode,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.get(
  '/change-gang',
  checkPermission(ACTION.GAME.PLAYER.GANG, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested change gangs.`)
    try {
      const gangs = Game.QBCore.Shared.Gangs

      ctx.body = {
        gangs: gangs,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/change-gang',
  checkPermission(ACTION.GAME.PLAYER.GANG, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change gang for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, name, grade } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)
      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      const resCode = player.Functions.SetGang(name, grade)
      if (resCode) player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed gang to ${name} ${grade} for ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: resCode,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.get(
  '/:citizenid/screen',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested screenshot for citizenid ${ctx.params.citizenid}.`
    )

    const player = Game.QBCore.Functions.GetPlayerByCitizenId(
      ctx.params.citizenid
    )

    if (!player) {
      ctx.body = {
        resCode: false,
        resMsg: 'notFound',
      }
      ctx.status = 200
      return
    }

    const screenResponse = await getPlayerScreen(player.PlayerData.source)

    ctx.body = {
      resCode: !screenResponse.err,
      resMsg: 'success',
      img: screenResponse.data,
    }
    ctx.status = 200
  }
)

playerRouter.get(
  '/:citizenid/notes',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested save note for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const note = Database.getNote(ctx.params.citizenid)

      ctx.body = {
        resCode: true,
        resMsg: 'success',
        note: note,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/:citizenid/notes',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested save note for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const { note } = ctx.request.body

      const { resCode, resMsg } = await Database.saveNote(
        ctx.params.citizenid,
        note
      )

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

playerRouter.get(
  '/:citizenid',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested player with citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

      if (player) {
        const ped = GetPlayerPed(player.PlayerData.source)
        if (DoesEntityExist(ped)) {
          const [playerX, playerY, playerZ] = GetEntityCoords(ped)
          player.PlayerData.position = { x: playerX, y: playerY, z: playerZ }
          player.PlayerData.health = GetEntityHealth(ped)
        }
        player.PlayerData.discord = Game.QBCore.Functions.GetIdentifier(
          player.PlayerData.source,
          'discord'
        )?.split(':')[1]

        const tmpIP = Game.QBCore.Functions.GetIdentifier(
          player.PlayerData.source,
          'ip'
        )
        const isIPv6 = tmpIP?.split(':').length - 1 > 1
        player.PlayerData.ip = isIPv6 ? tmpIP : tmpIP?.split(':')[1]

        player.PlayerData.bucket = GetPlayerRoutingBucket(
          player.PlayerData.source
        )
      } else {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      player.banned = await isPlayerBanned(player.PlayerData.license)
      player.bans = await getPlayerBans(citizenid)

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} requested ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: !!player,
        player: player,
        moneyTypes: unlEnv.config.additionalMoneyTypes,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/:citizenid/vehicle-count',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const citizenid = ctx.params.citizenid
      const { filter } = ctx.request.body
      const data = await getPlayerDatabaseVehicleCount(citizenid, filter)

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

playerRouter.post(
  '/:citizenid/vehicles',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested player vehicles for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const vehicles = await getPlayerVehicles(
        startRow,
        count,
        filter,
        sortBy,
        descending,
        citizenid
      )

      playerLogger.info(
        `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} requested player vehicles.`
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

playerRouter.post(
  '/set-meta',
  checkPermission(ACTION.GAME.PLAYER.META, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change meta for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, meta, value } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)
      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      if (player.PlayerData.source && meta === 'isdead')
        handleIsDead(value, player.PlayerData.source)
      if (player.PlayerData.source && meta === 'ishandcuffed')
        handleHandCuffed(value, player.PlayerData.source)
      if (player.PlayerData.source && meta === 'armor')
        handlePlayerArmor(player.PlayerData.source)

      player.Functions.SetMetaData(meta, value)
      player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed meta ${meta} for ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname} to ${value}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: meta,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/set-charinfo',
  checkPermission(ACTION.GAME.PLAYER.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change charinfo for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, charinfo } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)
      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      const idCardData = {
        citizenid: player.PlayerData.citizenid,
        gender: charinfo.gender,
        firstname: charinfo.firstname,
        birthdate: charinfo.birthdate,
        lastname: charinfo.lastname,
        nationality: charinfo.nationality,
      }

      player.Functions.SetPlayerData('cid', charinfo.cid)
      player.Functions.SetPlayerData('charinfo', charinfo)

      if (player.PlayerData.source) {
        if (GetResourceState(unlEnv.inventory) === 'started') {
          global.exports[unlEnv.inventory].SetItemData(
            player.PlayerData.source,
            'id_card',
            'info',
            idCardData
          )

          let visum = global.exports[unlEnv.inventory].GetItemByName(
            player.PlayerData.source,
            'visumpass'
          )

          if (visum) {
            visum.info = {
              birthdate: charinfo.birthdate,
              citizenid: player.PlayerData.citizenid,
              visumstart: visum.info.visumstart,
              firstname: charinfo.firstname,
              lastname: charinfo.lastname,
              visumend: visum.info.visumend,
              gender: charinfo.gender,
            }

            global.exports[unlEnv.inventory].SetItemData(
              player.PlayerData.source,
              'id_card',
              'info',
              visum.info
            )
          }
        }
      } else {
        const items = player.PlayerData.items

        for (const [_, value] of Object.entries(items)) {
          if (value.name === 'id_card') {
            value.info = idCardData
            break
          }

          if (value.name === 'visumpass') {
            value.info = {
              birthdate: charinfo.birthdate,
              citizenid: player.PlayerData.citizenid,
              visumstart: value.info.visumstart,
              firstname: charinfo.firstname,
              lastname: charinfo.lastname,
              visumend: value.info.visumend,
              gender: charinfo.gender,
            }
          }
        }
        player.Functions.SetPlayerData('items', items)
      }

      player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed charinfo for ${charinfo.firstname} ${charinfo.lastname}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'success',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/set-money',
  checkPermission(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested set money ${ctx.request.body.type} for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, type, value } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)
      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      player.Functions.SetMoney(type, value)
      player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed money ${type} for ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname} to ${value}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'success',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/add-money',
  checkPermission(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested add money ${ctx.request.body.type} for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, type, value } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      player.Functions.AddMoney(type, value, `By ${ctx.session.auth.user.name}`)
      player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} gave ${value} ${type} to ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'success',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/remove-money',
  checkPermission(ACTION.GAME.PLAYER.MONEY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested remove money ${ctx.request.body.type} for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, type, value } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      const success = player.Functions.RemoveMoney(
        type,
        value,
        `By ${ctx.session.auth.user.name}`
      )
      player.Functions.Save()

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} removed ${value} ${type} from ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: success,
        resMsg: success ? 'success' : 'not_allowed',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/teleport',
  checkPermission(ACTION.GAME.PLAYER.POSITION, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested teleport for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, coords } = ctx.request.body
      const player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notOnline',
        }
        ctx.status = 200
        return
      }

      teleportTo(coords, player.PlayerData.source)

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} teleported to [x: ${coords.x},  y: ${coords.y}].`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'success',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/kick',
  checkPermission(ACTION.GAME.PLAYER.KICK, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} kicked player with id ${ctx.request.body.source} (${ctx.request.body.reason}).`
    )
    try {
      const { source, reason } = ctx.request.body
      const player = Game.QBCore.Functions.GetPlayer(source)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notOnline',
        }
        ctx.status = 200
        return
      }

      Game.QBCore.Functions.Kick(source, reason)

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} kicked ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname} with reason '${ctx.request.body.reason}.'`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'kicked',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/warn',
  checkPermission(ACTION.GAME.PLAYER.WARN, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested warn player with citizenid ${ctx.request.body.citizenid} (${ctx.request.body.reason}).`
    )
    try {
      const { citizenid, reason } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'invalid_citizenid',
        }
        ctx.status = 200
        return
      }

      banFile.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} has warned ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname} with reason '${reason}'.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'warn',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/ban',
  checkPermission(ACTION.GAME.PLAYER.BAN, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested ban player with citizenid ${ctx.request.body.citizenid} (${ctx.request.body.reason}).`
    )
    try {
      const { citizenid, time, reason, hwid } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

      const inputTime =
        global.exports[unlEnv.resourceName].getOsTime() + parseInt(time)
      const banTime = inputTime > 2147483647 ? 2147483647 : inputTime

      if (player) {
        const playerTokens = global.exports[unlEnv.resourceName].getHWID(
          player.PlayerData.source
        )

        await handlePlayerBan(
          player.PlayerData.name,
          player.PlayerData.license,
          Game.QBCore.Functions.GetIdentifier(
            player.PlayerData.source,
            'discord'
          ),
          Game.QBCore.Functions.GetIdentifier(player.PlayerData.source, 'ip'),
          reason,
          banTime,
          `Unlimited - ${ctx.session.auth.user.name}`,
          hwid ? playerTokens : ''
        )
        DropPlayer(player.PlayerData.source, `🔨 - ${reason}`)
      } else {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
        await handlePlayerBan(
          player.PlayerData.name,
          player.PlayerData.license,
          null,
          null,
          reason,
          banTime,
          `Unlimited - ${ctx.session.auth.user.name}`
        )
      }

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${
          ctx.session.auth.user.name
        } has banned ${player.PlayerData.charinfo.firstname} ${
          player.PlayerData.charinfo.lastname
        } until ${new Date(banTime * 1000)} with reason '${
          ctx.request.body.reason
        }'.`
      )
      banFile.info(
        `[${player.PlayerData.citizenid}] ${
          ctx.session.auth.user.name
        } has banned ${player.PlayerData.charinfo.firstname} ${
          player.PlayerData.charinfo.lastname
        } until ${new Date(banTime * 1000)} with reason '${
          ctx.request.body.reason
        }'.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'ban',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/unban',
  checkPermission(ACTION.GAME.PLAYER.BAN, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested unban player with citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

      if (player) {
        await resetPlayerBan(player.PlayerData.license)
      } else {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
        await resetPlayerBan(player.PlayerData.license)
      }

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} had unban ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'unban',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/delete',
  checkPermission(ACTION.GAME.PLAYER.DELETE, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete player with citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid } = ctx.request.body
      let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

      if (!player) {
        player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(
          citizenid
        )
      }

      Game.QBCore.Player.ForceDeleteCharacter(citizenid)

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} deleted ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'delete',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/heal',
  checkPermission(ACTION.GAME.PLAYER.META, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested heal for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      if (!player.PlayerData.source) {
        ctx.body = {
          resCode: false,
          resMsg: 'notOnline',
        }
        ctx.status = 200
        return
      }

      handleHealPlayer(player.PlayerData.source)

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} healed ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'healed',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerRouter.post(
  '/bucket',
  checkPermission(ACTION.GAME.PLAYER.META, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested change bucket for citizenid ${ctx.request.body.citizenid}.`
    )
    try {
      const { citizenid, bucket } = ctx.request.body
      const player = await getPlayer(citizenid)

      if (!player) {
        ctx.body = {
          resCode: false,
          resMsg: 'notFound',
        }
        ctx.status = 200
        return
      }

      if (!player.PlayerData.source) {
        ctx.body = {
          resCode: false,
          resMsg: 'notOnline',
        }
        ctx.status = 200
        return
      }

      SetPlayerRoutingBucket(
        player.PlayerData.source,
        bucket === null ? 0 : parseInt(bucket)
      )

      playerLogger.info(
        `[${player.PlayerData.citizenid}] ${ctx.session.auth.user.name} changed bucket for ${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname} to ${bucket}.`
      )

      ctx.body = {
        resCode: true,
        resMsg: 'changedBucket',
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default playerRouter
