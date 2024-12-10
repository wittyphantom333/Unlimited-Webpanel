import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import {
  getDatabaseAccountsCount,
  getDatabaseAccountsPlayersCount,
  getPartialDatabaseAccountPlayers,
  getPartialDatabaseAccounts,
} from './accounts.service'

export const accountRouter = new router({ prefix: '/accounts' })

accountRouter.post(
  '/',
  checkPermission(ACTION.GAME.ACCOUNT.READ, RESOURCE.GAME),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all accounts.`)
    try {
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const accounts = await getPartialDatabaseAccounts(
        startRow,
        count,
        filter,
        sortBy,
        descending
      )

      ctx.body = {
        accounts: accounts,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

accountRouter.post(
  '/account-count',
  checkPermission(ACTION.GAME.ACCOUNT.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { filter } = ctx.request.body
      const data = await getDatabaseAccountsCount(filter)

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

accountRouter.post(
  '/account-player-count',
  checkPermission(ACTION.GAME.ACCOUNT.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const { license, filter } = ctx.request.body
      const data = await getDatabaseAccountsPlayersCount(license, filter)

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

accountRouter.post(
  '/:license',
  checkPermission(ACTION.GAME.ACCOUNT.READ, RESOURCE.GAME),
  async ctx => {
    try {
      const license = ctx.params.license
      const { startRow, count, filter, sortBy, descending } = ctx.request.body
      const players = await getPartialDatabaseAccountPlayers(
        license,
        startRow,
        count,
        filter,
        sortBy,
        descending
      )

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

export default accountRouter
