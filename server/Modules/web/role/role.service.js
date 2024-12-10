import { Database } from '../../../index'

export const createRole = async (name, desc, permissions, color) => {
  const { resCode, resMsg } = await Database.createRole(
    name,
    desc,
    permissions,
    color
  )

  return { resCode: resCode, resMsg: resMsg }
}

export const getRole = async name => {
  return Database.getRole(name)
}

export const getRoles = async () => {
  return Database.getRoles()
}

export const getRolePermissions = async name => {
  if (typeof name !== 'string') return []
  const role = Database.getRole(name)

  return role ? role.permissions : []
}

export const hasRolePermission = async (name, permAction, permResource) => {
  if (typeof name !== 'string') return false
  const role = Database.getRole(name)

  return role
    ? role.permissions.some(
        p => p.action === permAction && p.subject === permResource
      )
    : false
}

export const updateRole = async (name, desc, permissions, color) => {
  return Database.updateRole(name, desc, permissions, color)
}

export const deleteRole = async name => {
  return Database.deleteRole(name)
}
