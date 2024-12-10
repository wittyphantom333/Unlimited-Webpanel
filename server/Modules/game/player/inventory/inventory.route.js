import router from '@koa/router'
import { checkPermission } from '../../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../../common/permissions'
import { webLogger } from '../../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../../Logging/UnlLogger'
import { getPlayer } from '../player.service'
import {
  handleAddItem,
  handleClearInventory,
  handleDeleteItem,
  handleEditItem,
  handleFixInventory,
  handleMoveItem,
} from './inventory.service'
import { unlEnv } from '../../../../globalData'
import { Game } from '../../../../index'
import { playerLogger } from '../../../../Logging/Modules/PlayerLogger'
import {
  getSupporterStash,
  STORAGE_IDENTIFIERS,
} from '../../../../Utils/item.utils'

const playerInventoryRouter = new router({ prefix: '/:citizenid/inventory' })

playerInventoryRouter.get(
  '/',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested inventory for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const player = await getPlayer(citizenid)

      if (!player) {
        // unknown citizen id
        ctx.body = {
          resCode: false,
          resMsg: 'unknown_citizenid',
        }
        return
      }

      const inventory = player.PlayerData.items
      const stash = await getSupporterStash()
      const playerSlots = unlEnv.maxPlayerSlots

      playerLogger.info(
        `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} viewed inventory.`
      )

      ctx.body = {
        resCode: true,
        inventory: inventory,
        stash: stash,
        playerSlots: playerSlots,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

playerInventoryRouter.post(
  '/move',
  checkPermission(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested move item for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { fromStorage, toStorage, fromSlot, toSlot, amount } =
        ctx.request.body
      const fromStorageName =
        fromStorage === 'p' ? 'Player-Inventory' : 'Supporter-Stash'
      const toStorageName =
        toStorage === 'p' ? 'Player-Inventory' : 'Supporter-Stash'
      const { resCode, resMsg, resItems } = await handleMoveItem(
        citizenid,
        fromStorage,
        toStorage,
        fromSlot,
        toSlot,
        amount
      )

      if (resCode)
        if (resItems.didSwap)
          playerLogger.info(
            `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} swaped item ${resItems.item} from ${fromStorageName} slot ${fromSlot} with item ${resItems.toItem} from ${toStorageName} slot ${toSlot} in inventory.`
          )
        else
          playerLogger.info(
            `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} moved item ${resItems.item} from ${fromStorageName} slot ${fromSlot} to ${toStorageName} slot ${toSlot} in inventory.`
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

playerInventoryRouter.post(
  '/delete',
  checkPermission(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete item for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid

      const { fromStorage, fromSlot, amount } = ctx.request.body
      const storageName =
        fromStorage === 'p' ? 'Player-Inventory' : 'Supporter-Stash'
      const { resCode, resMsg, resItem } = await handleDeleteItem(
        citizenid,
        fromStorage,
        fromSlot,
        amount
      )

      if (resCode)
        playerLogger.info(
          `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} deleted item ${resItem.name} from ${storageName} slot ${fromSlot} in inventory.`
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

playerInventoryRouter.post(
  '/add',
  checkPermission(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested add item for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { storage, item } = ctx.request.body
      const { resCode, resMsg } = await handleAddItem(citizenid, storage, item)

      if (resCode && storage === STORAGE_IDENTIFIERS.PLAYER)
        playerLogger.info(
          `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} added ${item.amount}x ${item.name} to inventory.`
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

playerInventoryRouter.post(
  '/edit',
  checkPermission(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested edit item for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { fromStorage, fromSlot, item } = ctx.request.body
      const { resCode, resMsg } = await handleEditItem(
        citizenid,
        fromStorage,
        fromSlot,
        item
      )

      if (resCode)
        playerLogger.info(
          `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} edited ${item.name} at slot ${fromSlot} in inventory.`
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

playerInventoryRouter.post(
  '/clear',
  checkPermission(ACTION.GAME.PLAYER.INVENTORY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested clear inv for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { resCode, resMsg } = await handleClearInventory(citizenid)

      if (resCode)
        playerLogger.info(
          `[${ctx.params.citizenid}] ${ctx.session.auth.user.name} cleared inventory.`
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

playerInventoryRouter.post(
  '/fix-items',
  checkPermission(ACTION.GAME.PLAYER.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested fix inv for citizenid ${ctx.params.citizenid}.`
    )
    try {
      const citizenid = ctx.params.citizenid
      const { resCode, resMsg, resItems } = await handleFixInventory(citizenid)

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
        resItems: resItems,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default playerInventoryRouter
