import jwt from 'jsonwebtoken'
import router from '@koa/router'

import * as AuthService from './auth.service'
import * as UserService from '../../web/user/user.service'
import * as RoleService from '../../web/role/role.service'
import { webLogger } from '../../../Logging/Modules/WebLogger'
import { Database } from '../../../index'
import CitizenFXProvider from '../../../Provider/citizenfx.provider'

export const authRouter = new router({ prefix: '/auth' })

const cfxProvider = new CitizenFXProvider()

const providers = {
  citizenfx: cfxProvider,
}

authRouter.post('/login', async function (ctx) {
  const { username, password } = ctx.request.body
  const user = await AuthService.checkCredentials(username, password)

  webLogger.info(`Login attempt on ${username} from ${ctx.request.ip}`)

  ctx.status = 200

  if (user) {
    if (!user.isMaster && user.roleId === null) {
      ctx.body = {
        error: {
          title: 'Error',
          msg: 'No master account and role assigned',
        },
      }
      webLogger.warn(
        `Login failed for ${username}. No master account and role assigned.`
      )
      return
    }

    const accessToken = jwt.sign(
      { userId: user.name },
      Database.getConfigValue('tokenSecret'),
      {
        expiresIn: '6h',
      }
    )
    const refreshToken = jwt.sign(
      { userId: user.name },
      Database.getConfigValue('tokenSecret'),
      {
        expiresIn: '1d',
      }
    )

    // set refreshToken/userData on session
    ctx.session.auth = {
      refreshToken: refreshToken,
      user: {
        name: user.name,
        roleId: user.roleId,
        isMaster: user.isMaster,
      },
    }

    // send accessToken to client
    ctx.body = {
      status: 200,
      accessToken: accessToken,
      userData: {
        ability: await RoleService.getRolePermissions(user.roleId),
        isMaster: user.isMaster,
      },
    }
  } else {
    ctx.body = {
      error: {
        title: 'Error',
        msg: 'Invalid username or password',
      },
    }
  }
})

authRouter.post('/logout', async function (ctx) {
  ctx.session = null
  ctx.status = 200
})

authRouter.post('/refresh', async function (ctx) {
  if (ctx.session.auth?.refreshToken) {
    const refreshToken = ctx.session.auth.refreshToken

    await jwt.verify(
      refreshToken,
      Database.getConfigValue('tokenSecret'),
      async (err, decoded) => {
        if (err) {
          // Wrong Refresh Token
          ctx.body = 'Create new Session'
          return (ctx.status = 200)
        } else {
          const user = await UserService.getUser(decoded.userId)

          if (!user) {
            ctx.body = 'Create new Session'
            ctx.status = 200
            return
          }

          // Correct token we send a new access token
          const accessToken = jwt.sign(
            { userId: decoded.userId },
            Database.getConfigValue('tokenSecret'),
            {
              expiresIn: '6h',
            }
          )

          ctx.body = {
            accessToken: accessToken,
            userData: {
              ability: await RoleService.getRolePermissions(user.roleId),
              isMaster: user.isMaster,
            },
          }
          return (ctx.status = 200)
        }
      }
    )
  } else {
    ctx.body = 'Create new Session'
    ctx.status = 200
  }
})

authRouter.post('/:provider/callback', async function (ctx) {
  const provider = ctx.params.provider

  if (!providers[provider]) {
    // provider not supported
    return (ctx.body = {
      resCode: false,
      resMsg: 'not_supported',
    })
  }

  const { resCode, resMsg } = await providers[provider].processCallback(ctx)

  if (!resCode) {
    return (ctx.body = {
      resCode: resCode,
      resMsg: resMsg,
    })
  }

  const { resCodeUser, resMsgUser } = await providers[provider].getUserInfo(
    resMsg.accessToken
  )

  if (!resCodeUser) {
    return (ctx.body = {
      resCode: resCodeUser,
      resMsg: resMsgUser,
    })
  }

  const { resCodeSession, resMsgSession } = await providers[
    provider
  ].createSession(ctx, resMsgUser.current_user)

  if (!resCodeSession) {
    return (ctx.body = {
      resCode: resCodeSession,
      resMsg: resMsgSession,
    })
  }

  ctx.body = {
    resCode: resCodeSession,
    resMsg: 'success',
    accessToken: resMsgSession.accessToken,
    userData: {
      ability: await RoleService.getRolePermissions(resMsgSession.user.roleId),
      isMaster: resMsgSession.user.isMaster,
    },
  }
})

authRouter.post('/:provider', async function (ctx) {
  const provider = ctx.params.provider

  if (!providers[provider]) {
    // provider not supported
    return (ctx.body = {
      resCode: false,
      resMsg: 'not_supported',
    })
  }

  const { resCode, resMsg } = await providers[provider].getAuthURL(
    ctx,
    ctx.session._sessCtx.opts.key
  )

  ctx.body = {
    resCode: resCode,
    resMsg: resMsg,
  }
})

export default authRouter
