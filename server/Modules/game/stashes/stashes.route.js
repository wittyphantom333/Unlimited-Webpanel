import router from '@koa/router'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { checkPermission } from '../../web/role/role.controller'
import {
  getDatabaseStashesCount,
  getPartialDatabaseStashes,
  getStorage,
  handleAddItem,
  handleClearStorage,
  handleDeleteItem,
  handleEditItem,
  handleMoveStashItem,
} from './stashes.service'
import { unlEnv } from '../../../globalData'
import { gameLogger } from '../../../Logging/Modules/GameLogger'
import {
  getSupporterStash,
  STORAGE_IDENTIFIERS,
} from '../../../Utils/item.utils'

const stashesRouter = new router({ prefix: '/stashes' })

const getStashSettings = type => {
  return unlEnv.config.stashTables.filter(s => s.type === type)[0]
}

stashesRouter.post(
  '/',
  checkPermission(ACTION.GAME.STASHES.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all stashes.`)
    try {
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const stashes = await getPartialDatabaseStashes(
        startRow,
        count,
        filter,
        sortBy,
        descending
      )

      ctx.body = {
        stashes: stashes,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

stashesRouter.post(
  '/stashes-count',
  checkPermission(ACTION.GAME.STASHES.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { filter } = ctx.request.body
      const data = await getDatabaseStashesCount(filter)

      ctx.body = {
        count: data[0].count,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

stashesRouter.post(
  '/get',
  checkPermission(ACTION.GAME.STASHES.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )
    try {
      const { type, identifier } = ctx.request.body
      const storageSettings = getStashSettings(type)
      const storage = await getStorage(identifier, storageSettings)
      const stash = await getSupporterStash()

      ctx.body = {
        resCode: true,
        storage: storage,
        stash: stash,
        storageSlots: storageSettings.maxSlots,
      }
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

stashesRouter.post(
  '/move',
  checkPermission(ACTION.GAME.STASHES.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested move item for ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )
    try {
      const {
        type,
        identifier,
        fromStorage,
        toStorage,
        fromSlot,
        toSlot,
        amount,
      } = ctx.request.body
      const storageSettings = getStashSettings(type)
      const fromStorageName =
        fromStorage === 'c' ? `${type}-${identifier}` : 'Supporter-Stash'
      const toStorageName =
        toStorage === 'c' ? `${type}-${identifier}` : 'Supporter-Stash'
      const { resCode, resMsg, resItems } = await handleMoveStashItem(
        identifier,
        storageSettings,
        fromStorage,
        toStorage,
        fromSlot,
        toSlot,
        amount
      )

      if (resCode)
        if (resItems.didSwap)
          gameLogger.info(
            `${ctx.session.auth.user.name} swaped item ${resItems.item} from ${fromStorageName} slot ${fromSlot} with item ${resItems.toItem} from ${toStorageName} slot ${toSlot}.`
          )
        else
          gameLogger.info(
            `${ctx.session.auth.user.name} moved item ${resItems.item} from ${fromStorageName} slot ${fromSlot} to ${toStorageName} slot ${toSlot}.`
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
stashesRouter.post(
  '/delete',
  checkPermission(ACTION.GAME.STASHES.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete item for ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )

    try {
      const { type, identifier, fromStorage, fromSlot, amount } =
        ctx.request.body
      const storageSettings = getStashSettings(type)
      const storageName =
        fromStorage === 'c' ? `${type}-${identifier}` : 'Supporter-Stash'

      const { resCode, resMsg, resItem } = await handleDeleteItem(
        identifier,
        storageSettings,
        fromStorage,
        fromSlot,
        amount
      )

      if (resCode)
        gameLogger.info(
          `${ctx.session.auth.user.name} deleted item ${resItem.name} from ${storageName} slot ${fromSlot} in inventory.`
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

stashesRouter.post(
  '/add',
  checkPermission(ACTION.GAME.STASHES.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested add item for ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )
    try {
      const { type, identifier, storage, item } = ctx.request.body
      const storageSettings = getStashSettings(type)

      const { resCode, resMsg } = await handleAddItem(
        identifier,
        storageSettings,
        storage,
        item
      )

      if (resCode && storage === STORAGE_IDENTIFIERS.STORAGE)
        gameLogger.info(
          `${ctx.session.auth.user.name} added ${item.amount}x ${item.name} to ${type} ${identifier}.`
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

stashesRouter.post(
  '/edit',
  checkPermission(ACTION.GAME.STASHES.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested edit item for ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )
    try {
      const { type, identifier, fromStorage, fromSlot, item } = ctx.request.body
      const storageSettings = getStashSettings(type)

      const { resCode, resMsg } = await handleEditItem(
        identifier,
        storageSettings,
        fromStorage,
        fromSlot,
        item
      )

      if (resCode && fromStorage === STORAGE_IDENTIFIERS.STORAGE)
        gameLogger.info(
          `${ctx.session.auth.user.name} edited ${item.name} at slot ${fromSlot} in ${type} ${identifier}.`
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
stashesRouter.post(
  '/clear',
  checkPermission(ACTION.GAME.STASHES.MODIFY, RESOURCE.GAME),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested clear stash for ${ctx.request.body.type} ${ctx.request.body.identifier}.`
    )
    try {
      const { type, identifier } = ctx.request.body
      const storageSettings = getStashSettings(type)
      const { resCode, resMsg } = await handleClearStorage(
        identifier,
        storageSettings
      )

      if (resCode)
        gameLogger.info(
          `${ctx.session.auth.user.name} cleared ${type} ${identifier}.`
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

export default stashesRouter
