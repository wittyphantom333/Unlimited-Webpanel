import { oxmysql as MySQL } from '@overextended/oxmysql'
import { unlEnv } from '../../../globalData'
import { UnlLogger } from '../../../Logging/UnlLogger'

export const getOwnedVehiclesPartial = async (
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const DESC = desc ? 'DESC' : 'ASC'
  const garageColumnName = unlEnv.config.vehGarageColumn
  const stateColumnName = unlEnv.config.vehStateColumn

  const query = `SELECT id, plate, vehicle, garage, engine, body, fuel, citizenid, ${stateColumnName} as state FROM player_vehicles WHERE license LIKE ? or citizenid LIKE ? or plate LIKE ? or ${garageColumnName} LIKE ? or vehicle LIKE ? ORDER BY ${orderBy} ${DESC} LIMIT ?, ?`

  return await MySQL.query(query, [
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    `%${filter}%`,
    start,
    count,
  ])
}
export const getPlayerOwnedVehiclesPartial = async (
  start,
  count,
  filter,
  orderBy,
  desc,
  citizenid
) => {
  const DESC = desc ? 'DESC' : 'ASC'
  const garageColumnName = unlEnv.config.vehGarageColumn
  const stateColumnName = unlEnv.config.vehStateColumn

  const query = `SELECT id, plate, vehicle, garage, engine, body, fuel, citizenid, ${stateColumnName} as state FROM player_vehicles WHERE citizenid = ? AND (plate LIKE ? or ${garageColumnName} LIKE ?) ORDER BY ${orderBy} ${DESC} LIMIT ?, ?`

  return await MySQL.query(query, [
    citizenid,
    `%${filter}%`,
    `%${filter}%`,
    start,
    count,
  ])
}

export const getDatabaseVehicleCount = async filter => {
  return await MySQL.query(
    'SELECT count(*) as count FROM player_vehicles WHERE license LIKE ? or citizenid LIKE ? or plate LIKE ?',
    [`%${filter}%`, `%${filter}%`, `%${filter}%`]
  )
}

export const getPlayerDatabaseVehicleCount = async (citizenid, filter) => {
  return await MySQL.query(
    'SELECT count(*) as count FROM player_vehicles WHERE citizenid = ? AND (plate LIKE ? or license LIKE ?)',
    [citizenid, `%${filter}%`, `%${filter}%`]
  )
}

export const getVehicleByPlate = async plate => {
  return await MySQL.query(
    'SELECT id, plate FROM player_vehicles WHERE plate = ?',
    [plate]
  )
}

export const getVehicleById = async id => {
  return await MySQL.query('SELECT * FROM player_vehicles WHERE id = ?', [id])
}

export const updateVehicleOwner = async (id, citizenid, license) => {
  return await MySQL.update(
    `UPDATE player_vehicles SET citizenid = ?, license = ? WHERE id = ?`,
    [citizenid, license, id],
    affectedRows => {
      return !!affectedRows
    }
  )
}

export const updateVehicleField = async (id, field, value) => {
  return await MySQL.update(
    `UPDATE player_vehicles SET ?? = ? WHERE id = ?`,
    [field, value, id],
    affectedRows => {
      return !!affectedRows
    }
  )
}

export const repairVehicle = async id => {
  return await MySQL.update(
    'UPDATE player_vehicles SET fuel = 100, body = 1000, engine = 1000 WHERE id = ?',
    [id],
    affectedRows => {
      return !!affectedRows
    }
  )
}

export const deleteVehicleDataset = async id => {
  return await MySQL.update(
    'DELETE FROM player_vehicles WHERE id = ? LIMIT 1',
    [id],
    affectedRows => {
      return !!affectedRows
    }
  )
}

export const updateVehiclePlate = async (id, plate, newPlate) => {
  const queries = [
    {
      query:
        "UPDATE player_vehicles SET `mods` = JSON_REPLACE(`mods`, '$.plate', :newPlate), plate = :newPlate WHERE plate = :plate AND id = :id",
      values: { newPlate: newPlate, plate: plate, id: id },
    },
  ]

  unlEnv.config.vehTables.forEach(veh => {
    queries.push({
      query: `UPDATE ${veh.table} SET ${veh.column} = :newPlate WHERE ${veh.column} = :plate`,
      values: { newPlate: newPlate, plate: plate },
    })
  })

  const success = await MySQL.transaction(queries)

  return { resCode: success, resMsg: success ? 'success' : 'sql_error' }
}

export const createPlayerVehicle = async (player, vehicle) => {
  try {
    const garageColumnName = unlEnv.config.vehGarageColumn
    const stateColumnName = unlEnv.config.vehStateColumn

    const success = await MySQL.insert(
      `INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, ${garageColumnName}, ${stateColumnName}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        player.PlayerData.license,
        player.PlayerData.citizenid,
        vehicle.model,
        GetHashKey(vehicle.model),
        '{}',
        vehicle.plate.toUpperCase(),
        vehicle.garage,
        vehicle.state || 1,
      ]
    )

    return { resCode: success, resMsg: success ? 'success' : 'sql_error' }
  } catch (e) {
    UnlLogger.error(e)
    return { resCode: false, resMsg: 'internal_error' }
  }
}
