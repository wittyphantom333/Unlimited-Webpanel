import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { Game } from '../../../index'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { devLogger } from '../../../Logging/Modules/DevLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'

export const gangRouter = new router({ prefix: '/gangs' })

gangRouter.get(
  '/',
  checkPermission(ACTION.DEV.GANG.READ, RESOURCE.DEV),
  async ctx => {
    devLogger.info(`${ctx.session.auth.user.name} requested all gangs.`)
    try {
      // toDo: implement side fetching e.g. 25 per request etc
      const gangs = Game.getGangs()

      ctx.body = {
        gangs: gangs,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

gangRouter.get(
  '/:id',
  checkPermission(ACTION.DEV.GANG.READ, RESOURCE.DEV),
  ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested gang ${ctx.params.id}.`
    )
    try {
      const gangId = ctx.params.id
      const gang = Game.getGang(gangId)

      ctx.body = {
        gang: gang,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

gangRouter.patch(
  '/save/:id',
  checkPermission(ACTION.DEV.GANG.MODIFY, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested save gang ${ctx.params.id}.`
    )
    try {
      const gangId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await Game.updateGang(gangId, data)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully saved gang ${gangId}.`
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

gangRouter.post(
  '/create',
  checkPermission(ACTION.DEV.GANG.CREATE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested create gang ${ctx.request.body.name}.`
    )
    try {
      const gang = ctx.request.body
      const { resCode, resMsg } = await Game.addGang(gang.name, gang)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully created gang ${gang.name}.`
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

gangRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.DEV.GANG.DELETE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested delete gang ${ctx.params.id}.`
    )
    try {
      const gangId = ctx.params.id
      const { resCode, resMsg } = await Game.deleteGang(gangId)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully deleted gang ${gangId}.`
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

export default gangRouter
