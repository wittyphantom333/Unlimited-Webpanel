import router from '@koa/router'
import { checkPermission } from './role.controller'

import * as RoleService from './role.service'
import { ACTION, RESOURCE } from '../../../../common/permissions'
import { UnlLogger } from '../../../Logging/UnlLogger'
import { webLogger } from '../../../Logging/Modules/WebLogger'
export const roleRouter = new router({ prefix: '/roles' })

roleRouter.get(
  '/',
  checkPermission(ACTION.WEB.ROLE.READ, RESOURCE.WEB),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested all roles.`)
    try {
      const roles = await RoleService.getRoles()

      ctx.body = { roles: roles }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

roleRouter.get(
  '/list',
  /* User Permission because only needed for user create */
  checkPermission(ACTION.WEB.USER.CREATE, RESOURCE.WEB),
  async ctx => {
    webLogger.info(`${ctx.session.auth.user.name} requested role list.`)
    try {
      const roles = await RoleService.getRoles()
      const rolesList = Object.values(roles).map(({ name, color }) => {
        return { value: name, color: color }
      })

      ctx.body = {
        roles: rolesList,
      }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

roleRouter.get(
  '/:id',
  checkPermission(ACTION.WEB.ROLE.READ, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested role ${ctx.params.id}.`
    )
    try {
      const roleId = ctx.params.id
      const role = await RoleService.getRole(roleId)

      ctx.body = { role: role }
      ctx.status = 200
    } catch (e) {
      UnlLogger.error(e.message)
      ctx.body = e.message
      ctx.status = 500
    }
  }
)

roleRouter.patch(
  '/save/:id',
  checkPermission(ACTION.WEB.ROLE.MODIFY, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested save role ${ctx.params.id}.`
    )
    try {
      const roleId = ctx.params.id
      const data = ctx.request.body
      const { resCode, resMsg } = await RoleService.updateRole(
        roleId,
        data.desc,
        data.permissions,
        data.color
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

roleRouter.post(
  '/create',
  checkPermission(ACTION.WEB.ROLE.CREATE, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested create role ${ctx.request.body.name}.`
    )
    try {
      const { name, desc, permissions, color } = ctx.request.body
      const { resCode, resMsg } = await RoleService.createRole(
        name,
        desc,
        permissions,
        color
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

roleRouter.delete(
  '/delete/:id',
  checkPermission(ACTION.WEB.ROLE.DELETE, RESOURCE.WEB),
  async ctx => {
    webLogger.info(
      `${ctx.session.auth.user.name} requested delete role ${ctx.params.id}.`
    )
    try {
      const roleId = ctx.params.id
      const { resCode, resMsg } = await RoleService.deleteRole(roleId)

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

export default roleRouter
