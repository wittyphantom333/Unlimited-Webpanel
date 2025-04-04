import router from '@koa/router'
import { checkPermission } from '../role/role.controller'

import { ACTION, RESOURCE } from '../../../../common/permissions'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { Database, Game } from '../../../index'
import {
  getSupporterStash,
  saveSupporterStash,
} from '../../../Utils/item.utils'

export const configRouter = new router({ prefix: '/config' })

configRouter.post(
  '/update',
  checkPermission(ACTION.WEB.CONFIG.MODIFY, RESOURCE.WEB),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested save config.`)
    try {
      const { colors, lang } = ctx.request.body
      await Database.updateConfigValue('colors', colors)
      await Database.updateConfigValue('lang', lang)

      ctx.body = { resCode: true }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

configRouter.post(
  '/fix-items',
  checkPermission(ACTION.WEB.CONFIG.MODIFY, RESOURCE.WEB),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested fix inv`)
    try {
      const stash = await getSupporterStash()
      await saveSupporterStash(stash)

      ctx.body = { resCode: true }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

export default configRouter
