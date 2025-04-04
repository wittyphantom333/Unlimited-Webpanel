import slash from 'slash'
import path from 'path'
import * as fs from 'fs'
import { ACTION } from '../common/permissions'
import { getConfig } from './Utils/config.load'

const cleanPath = x => {
  return slash(path.normalize(x))
}

const config = getConfig()

// Convars
const getConvarBool = convarName => {
  const cvar = GetConvar(convarName, config[convarName]).trim().toLowerCase()
  return ['true', '1', 'on'].includes(cvar)
}

const getConvarString = convarName => {
  const cvar = GetConvar(convarName, config[convarName]).trim()
  return cvar === 'false' ? false : cvar
}

const unlDisableServe = getConvarBool('unlDisableServe')
const unlMySQLSessions = getConvarBool('unlMySQLSessions')

const unlQBName = GetConvar('unlQBName', config.QBName).trim()
const unlQBObject = GetConvar('unlQBObject', config.QBObject).trim()
const unlQBShared = GetConvar('unlQBShared', config.QBShared).trim()

const inventory = GetConvar('unlUsedInventory', config.usedInventory).trim()
const inventoryForImage = GetConvar('inventoryForImage', config.inventoryForImage).trim()
const housingTable = GetConvar('housingTable', config.housingTable).trim()
const housingTableProperties = GetConvar('housingTableProperties', config.housingTableProperties).trim()
const inventoryImageFolder = GetConvar('unlInventoryImageFolder', config.inventoryImageFolder).trim()
const maxPlayerSlots = parseInt(
  GetConvar('unlMaxPlayerSlots', config.maxPlayerSlots).trim()
)
const inventoryImagePath = `${GetResourcePath(inventoryForImage)}${inventoryImageFolder}`

const unlDiscordHook = getConvarString('unlDiscordHook')
const unlGameDiscordHook = getConvarString('unlGameDiscordHook')
const unlPlayerDiscordHook = getConvarString('unlPlayerDiscordHook')
const unlDevDiscordHook = getConvarString('unlDevDiscordHook')
const unlWebDiscordHook = getConvarString('unlWebDiscordHook')

const unlWebPortConvar = GetConvar('unlWebPort', config.port).trim()
if (!/^\d+$/.test(unlWebPortConvar)) console.info('unlWebPort is not valid.')

const unlWebPort = parseInt(unlWebPortConvar)

const liveMapIntervalConvar = GetConvar(
  'unlWebMapInterval',
  config.mapInterval
).trim()
if (!/^\d+$/.test(liveMapIntervalConvar))
  console.info('unlWebMapInterval is not valid.')

const liveMapInterval = parseInt(liveMapIntervalConvar)

const dashboardIntervalConvar = GetConvar(
  'unlWebDashInterval',
  config.dashboardInterval
).trim()
if (!/^\d+$/.test(dashboardIntervalConvar))
  console.info('unlWebMapInterval is not valid.')

const dashInterval = parseInt(dashboardIntervalConvar)

// Web
const resourceName = GetCurrentResourceName()

const unlWebVersion = GetResourceMetadata(resourceName, 'version')
if (typeof unlWebVersion !== 'string' || unlWebVersion === 'null') {
  console.error('Unlimited - Spectre version not set or in the wrong format')
}

let unlWebResourcePath
const unlWebResourcePathConvar = GetResourcePath(resourceName)
if (
  typeof unlWebResourcePathConvar !== 'string' ||
  unlWebResourcePathConvar === 'null'
) {
  console.error('Could not resolve Unlimited - Spectre resource path')
} else {
  unlWebResourcePath = cleanPath(unlWebResourcePathConvar)
}

const dataPath = cleanPath(path.join(unlWebResourcePath, 'unlWeb'))

try {
  if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath)
} catch (error) {
  console.error(
    `Failed to check or create '${dataPath}' with error: ${error.message}`
  )
}

const configPath = `${dataPath}/data.json`

// Logs
const loggerPaths = {
  player: `${unlWebResourcePath}/unlWeb/logs/player.log`,
  game: `${unlWebResourcePath}/unlWeb/logs/game.log`,
  dev: `${unlWebResourcePath}/unlWeb/logs/dev.log`,
  web: `${unlWebResourcePath}/unlWeb/logs/web.log`,
  unlimited: `${unlWebResourcePath}/log.log`,
}

const banFile = `${unlWebResourcePath}/bans.log`

const loggerPerms = {
  player: ACTION.GAME.LOGS.PLAYER,
  game: ACTION.GAME.LOGS.GAME,
  dev: ACTION.GAME.LOGS.DEV,
  web: ACTION.GAME.LOGS.WEB,
  unlimited: ACTION.GAME.LOGS.READ,
}

export const unlEnv = Object.freeze({
  config,
  unlDisableServe,
  unlMySQLSessions,
  unlQBName,
  unlQBObject,
  unlQBShared,
  resourceName,
  unlWebPort,
  dashInterval,
  liveMapInterval,
  unlWebResourcePath,
  unlWebVersion,
  inventoryImagePath,
  inventory,
  housingTable,
  housingTableProperties,
  maxPlayerSlots,
  configPath,
  loggerPaths,
  banFile,
  loggerPerms,
  unlDiscordHook,
  unlDevDiscordHook,
  unlPlayerDiscordHook,
  unlWebDiscordHook,
  unlGameDiscordHook,
})

const qbPath = GetResourcePath(unlQBName)

export const qbEnv = {
  qbPath,
}
