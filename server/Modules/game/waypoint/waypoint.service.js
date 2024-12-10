import { Database } from '../../../index'

export const createWaypoint = async (name, label, coords) => {
  const { resCode, resMsg } = await Database.createWaypoint(name, label, coords)

  return { resCode: resCode, resMsg: resMsg }
}

export const getWaypoint = async name => {
  return Database.getWaypoint(name)
}

export const getWaypoints = async () => {
  return Database.getWaypoints()
}

export const updateWaypoint = async (name, label, coords) => {
  return Database.updateWaypoint(name, label, coords)
}

export const deleteWaypoint = async name => {
  return Database.deleteWaypoint(name)
}
