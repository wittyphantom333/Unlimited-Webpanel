import router from '@koa/router'
import {
  setSetupMode,
  getSetupMode,
  setupToken,
  Database,
} from '../../../index'
import * as UserService from '../../web/user/user.service'

export const setupRouter = new router()

setupRouter.get('/init', async function (ctx) {
  ctx.status = 200

  if (getSetupMode()) {
    ctx.body = { setup: true }
    return
  }

  ctx.body = {
    appData: {
      lang: Database.getConfigValue('lang'),
      colors: Database.getConfigValue('colors'),
    },
  }
})

setupRouter.post('/setup', async function (ctx) {
  if (!getSetupMode()) return (ctx.status = 500)

  ctx.status = 200

  let { language, username, password, token } = ctx.request.body

  if (!language || !username || !password || !token) {
    ctx.body = {
      status: 'error',
      title: 'Failed to Setup Unlimited Web',
      msg: 'Missing required fields',
    }
    return
  }

  if (token !== setupToken) {
    ctx.body = {
      status: 'error',
      title: 'Failed to Setup Unlimited Web',
      msg: 'Wrong Setup Token',
    }
    return
  }

  try {
    // toDo: add response options for create user
    await UserService.createUser(username, password, true)
    await Database.updateConfigValue('lang', language)

    setSetupMode(false)

    ctx.body = {
      lang: language,
    }
  } catch (e) {
    ctx.body = {
      status: 'error',
      title: 'Failed to Setup Unlimited Web',
      msg: 'Failed creating master user',
    }
  }
})

export default setupRouter
