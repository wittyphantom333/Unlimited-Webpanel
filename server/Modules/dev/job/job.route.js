import router from '@koa/router'
import { checkPermission } from '../../web/role/role.controller'
import { Game } from '../../../index'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { devLogger } from '../../../Logging/Modules/DevLogger'
import { UnlLogger } from '../../../Logging/UnlLogger'

export const jobRouter = new router({ prefix: '/jobs' })

jobRouter.get(
  '/',
  checkPermission(ACTION.DEV.JOB.READ, RESOURCE.DEV),
  async ctx => {
    devLogger.info(`${ctx.session.auth.user.name} requested all jobs.`)
    try {
      // toDo: implement side fetching e.g. 25 per request etc
      const jobs = Game.getJobs()

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

jobRouter.get(
  '/:id',
  checkPermission(ACTION.DEV.JOB.READ, RESOURCE.DEV),
  ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested job ${ctx.params.id}.`
    )
    try {
      const jobId = ctx.params.id
      const job = Game.getJob(jobId)

      ctx.body = {
        job: job,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

jobRouter.patch(
  '/save/:id',
  checkPermission(ACTION.DEV.JOB.MODIFY, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested save job ${ctx.params.id}.`
    )
    try {
      const jobId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await Game.updateJob(jobId, data)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully saved job ${jobId}.`
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

jobRouter.post(
  '/create',
  checkPermission(ACTION.DEV.JOB.CREATE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested create job ${ctx.request.body.name}.`
    )
    try {
      const job = ctx.request.body
      const { resCode, resMsg } = await Game.addJob(job.name, job)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully created item ${job.name}.`
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

jobRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.DEV.JOB.DELETE, RESOURCE.DEV),
  async ctx => {
    devLogger.info(
      `${ctx.session.auth.user.name} requested delete job ${ctx.params.id}.`
    )
    try {
      const jobId = ctx.params.id
      const { resCode, resMsg } = await Game.deleteJob(jobId)

      if (resCode)
        devLogger.info(
          `${ctx.session.auth.user.name} successfully deleted job ${jobId}.`
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

export default jobRouter
