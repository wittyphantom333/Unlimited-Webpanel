import {
  deleteVehicleDataset,
  getOwnedVehiclesPartial,
  getPlayerOwnedVehiclesPartial,
  getVehicleById,
  updateVehicleField,
  updateVehicleOwner,
} from './vehicle.service'
import { unlEnv } from '../../../globalData'

export const getVehicleHandle = plate => {
  const vehicleHandles = GetAllVehicles()
  const searchPlate = plate.trim().toUpperCase()

  let foundHandle = false
  vehicleHandles.some(function (handle) {
    const curPlate = GetVehicleNumberPlateText(handle)
    if (curPlate.trim() === searchPlate) {
      foundHandle = handle
      return true
    }
  })

  return foundHandle
}

export const getPartialDatabaseVehicles = async (
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const ownedVehicles = await getOwnedVehiclesPartial(
    start,
    count,
    filter,
    orderBy,
    desc
  )
  if (ownedVehicles.length === 0) return []

  const vehicleHandles = GetAllVehicles()
  vehicleHandles.forEach(handle => {
    const plate = GetVehicleNumberPlateText(handle)
    const matchedVeh = ownedVehicles.find(
      e => e.plate.trim() === plate.trim().toUpperCase()
    )
    if (matchedVeh) matchedVeh.spawned = true
  })

  return ownedVehicles
}

export const getPlayerVehicles = async (
  startRow,
  count,
  filter,
  sortBy,
  descending,
  citizenid
) => {
  const ownedVehicles = await getPlayerOwnedVehiclesPartial(
    startRow,
    count,
    filter,
    sortBy,
    descending,
    citizenid
  )
  if (ownedVehicles.length === 0) return []

  const vehicleHandles = GetAllVehicles()
  vehicleHandles.forEach(handle => {
    const plate = GetVehicleNumberPlateText(handle)
    const matchedVeh = ownedVehicles.find(
      e => e.plate.trim() === plate.trim().toUpperCase()
    )
    if (matchedVeh) matchedVeh.spawned = true
  })

  return ownedVehicles
}

export const getVehicle = async id => {
  let vehicle = await getVehicleById(id)

  vehicle = vehicle[0]
  if (!vehicle) return null

  vehicle.garage = vehicle[unlEnv.config.vehGarageColumn]

  vehicle.mods = JSON.parse(vehicle.mods)

  return vehicle
}

export const updateVehicleOwnerData = async (id, citizenid, license) => {
  return await updateVehicleOwner(id, citizenid, license)
}

export const updateVehicleFieldData = async (id, field, value) => {
  const fields = [
    'fuel',
    'engine',
    'body',
    'state',
    'garage',
    'drivingdistance',
    'depotprice',
    'balance',
    'paymentamount',
    'paymentsleft',
    'financetime',
  ]
  if (!fields.includes(field)) return false

  let cField = field
  if (field === 'garage') cField = unlEnv.config.vehGarageColumn
  if (field === 'state') cField = unlEnv.config.vehStateColumn

  return await updateVehicleField(id, cField, value)
}

export const deleteVehicle = async id => {
  return await deleteVehicleDataset(id)
}
