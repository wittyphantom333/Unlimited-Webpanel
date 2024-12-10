import { Database } from '../../../index'

export const createUser = async (
  username,
  password,
  isMaster,
  roleId = null,
  fxname = ''
) => {
  const { resCode, resMsg } = await Database.createUser(
    username,
    password,
    isMaster,
    roleId,
    fxname
  )

  return { resCode: resCode, resMsg: resMsg }
}

export const getUsers = async () => {
  return Database.getUsers()
}
export const getUser = async username => {
  return Database.getUser(username)
}

export const updateUser = async (username, roleId, fxname) => {
  return Database.updateUser(username, roleId, fxname)
}

export const deleteUser = async username => {
  return Database.deleteUser(username)
}

export const changePassword = async (username, password) => {
  return Database.updatePassword(username, password)
}
