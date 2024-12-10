import { oxmysql as MySQL } from '@overextended/oxmysql'
import { Game } from '../../../index'
import { unlEnv } from '../../../globalData'

export const getPlayer = async citizenid => {
  let player = Game.QBCore.Functions.GetPlayerByCitizenId(citizenid)

  if (!player) {
    // player offline
    player = await Game.QBCore.Functions.GetOfflinePlayerByCitizenId(citizenid)
  }

  return player
}

export const getDatabasePlayersCount = async filter => {
  return await MySQL.query(
    "SELECT count(*) as count FROM players WHERE license LIKE ? or citizenid LIKE ? or name LIKE ? or JSON_EXTRACT(`charinfo`, '$.firstname') LIKE ? or JSON_EXTRACT(`charinfo`, '$.lastname') LIKE ?",
    [`%${filter}%`, `%${filter}%`, `%${filter}%`, `%${filter}%`, `%${filter}%`]
  )
}

export const getPartialDatabasePlayers = async (
  start,
  count,
  filter,
  orderBy,
  desc
) => {
  const DESC = desc ? 'DESC' : 'ASC'
  const query = `SELECT name, license, citizenid, job, gang, charinfo, JSON_EXTRACT(\`charinfo\`, '$.firstname') as firstname, JSON_EXTRACT(\`charinfo\`, '$.lastname') as lastname FROM players WHERE license LIKE ? or citizenid LIKE ? or name LIKE ? or JSON_EXTRACT(\`charinfo\`, '$.firstname') LIKE ? or JSON_EXTRACT(\`charinfo\`, '$.lastname') LIKE ? ORDER BY ${orderBy} ${DESC} LIMIT ?, ?;`

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

export const getPlayerInventoryFromDB = async citizenid => {
  return await MySQL.single(
    'SELECT inventory FROM players WHERE citizenid = ? LIMIT 1',
    [citizenid]
  )
}

export const savePlayerInventoryToDB = async (citizenid, items) => {
  await MySQL.update('UPDATE players SET inventory = ? WHERE citizenid = ?', [
    items,
    citizenid,
  ])
}

export const isPlayerBanned = async plicense => {
  return await MySQL.query(
    'SELECT reason, expire, bannedby  FROM bans WHERE license = ?',
    [plicense]
  )
}

export const changePlayerAccount = async (citizenid, license) => {
  const playerUpdate = await MySQL.update(
    'UPDATE players SET license = ? WHERE citizenid = ?',
    [license, citizenid],
    affectedRows => {
      return affectedRows
    }
  )

  const vehUpdate = await MySQL.update(
    'UPDATE player_vehicles SET license = ? WHERE citizenid = ?',
    [license, citizenid],
    affectedRows => {
      return affectedRows
    }
  )

  return playerUpdate && vehUpdate
}

export const handlePlayerBan = async (
  name,
  license,
  discord,
  ip,
  reason,
  banTime,
  bannedBy,
  playerTokens
) => {
  return await MySQL.insert(
    'INSERT INTO bans (name, license, discord, ip, reason, expire, bannedby, tokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, license, discord, ip, reason, banTime, bannedBy, playerTokens]
  )
}

export const resetPlayerBan = async plicense => {
  return await MySQL.update(
    'DELETE FROM bans WHERE license = ?',
    [plicense],
    affectedRows => {
      return !!affectedRows
    }
  )
}

export const handleIsDead = (value, src) => {
  if (unlEnv.config.customHandleDeadEvent !== 'false') {
    TriggerEvent(unlEnv.config.customHandleDeadEvent, src, value)
    return
  }

  if (value) TriggerClientEvent('hospital:client:KillPlayer', src)
  else {
    TriggerClientEvent('hospital:client:Revive', src)
    TriggerClientEvent('hospital:client:HealInjuries', src, 'full')
  }
}

export const handleHandCuffed = (value, src) => {
  if (unlEnv.config.customHandleCuffedEvent !== 'false') {
    TriggerEvent(unlEnv.config.customHandleCuffedEvent, src, value)
    return
  }

  TriggerClientEvent('police:client:GetCuffed', src, -1, true)
}

export const teleportTo = (coords, src) => {
  TriggerClientEvent('unlWeb:player:teleport', src, coords)
}

export const handlePlayerArmor = src => {
  const ped = GetPlayerPed(src)
  if (DoesEntityExist(ped)) SetPedArmour(ped, 100)
}

export const handleHealPlayer = src => {
  TriggerClientEvent('unlWeb:player:heal', src)
  TriggerClientEvent('hospital:client:HealInjuries', src, 'full')
}

export const getPlayerScreen = src => {
  return new Promise(resolve => {
    global.exports['screenshot-basic'].requestClientScreenshot(
      src,
      {},
      (err, data) => {
        resolve({ err, data })
      }
    )
  })
}
