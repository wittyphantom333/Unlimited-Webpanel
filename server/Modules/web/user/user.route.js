import router from '@koa/router'
import { checkPermission } from '../role/role.controller'

import { ACTION, RESOURCE } from '../../../../common/permissions'

import * as UserService from './user.service'
import * as RoleService from '../role/role.service'
import { customAlphabet } from 'nanoid'
import dict51 from 'nanoid-dictionary/nolookalikes'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { webLogger } from '../../../Logging/Modules/WebLogger'

export const userRouter = new router({ prefix: '/users' })

userRouter.get(
  '/',
  checkPermission(ACTION.WEB.USER.READ, RESOURCE.WEB),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all users.`)
    try {
      const users = await UserService.getUsers()

      ctx.body = { users: users }
      ctx.status = 200
    } catch (e) {
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

userRouter.get(
  '/:id',
  checkPermission(ACTION.WEB.USER.READ, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested user ${ctx.params.id}.`
    )
    try {
      const user = await UserService.getUser(ctx.params.id)
      const roles = await RoleService.getRoles()

      const rolesList = Object.values(roles).map(({ name, color }) => {
        return { value: name, color: color }
      })

      ctx.body = { user: user, roles: rolesList }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

userRouter.patch(
  '/save/:id',
  checkPermission(ACTION.WEB.USER.MODIFY, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested save user ${ctx.params.id}.`
    )
    try {
      const userId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await UserService.updateUser(
        userId,
        data.roleId,
        data.fxname
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

userRouter.post(
  '/create',
  checkPermission(ACTION.WEB.USER.CREATE, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested create user ${ctx.request.body.name}.`
    )
    try {
      const { name, roleId, password, fxname } = ctx.request.body
      const { resCode, resMsg } = await UserService.createUser(
        name,
        password,
        false,
        roleId,
        fxname
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

userRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.WEB.USER.DELETE, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete user ${ctx.params.id}.`
    )
    try {
      const userId = ctx.params.id
      const { resCode, resMsg } = await UserService.deleteUser(userId)

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

userRouter.post(
  '/password/reset',
  checkPermission(ACTION.WEB.USER.MODIFY, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested password reset for ${ctx.request.body.userId}.`
    )
    try {
      const data = ctx.request.body
      const user = await UserService.getUser(data.userId)

      if (user.isMaster) {
        ctx.body = {
          resCode: false,
          resMsg: 'is_master',
        }
        ctx.status = 200
        return
      }

      const password = customAlphabet(dict51, 20)()

      const { resCode, resMsg } = await UserService.changePassword(
        data.userId,
        password
      )

      ctx.body = {
        resCode: resCode,
        resMsg: resMsg,
        newPw: password,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

userRouter.patch(
  '/password/change',
  checkPermission(ACTION.APP.DASHBOARD, RESOURCE.APP),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested password change.`)
    try {
      const data = ctx.request.body
      const { resCode, resMsg } = await UserService.changePassword(
        ctx.session.auth.user.name,
        data.password
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

export default userRouter
