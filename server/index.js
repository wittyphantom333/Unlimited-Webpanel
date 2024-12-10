import { qbEnv, unlEnv } from './globalData'
import { UnlLogger } from './Logging/UnlLogger'
import { customAlphabet } from 'nanoid'
import dict51 from 'nanoid-dictionary/nolookalikes'
import DatabaseController from './Utils/db.controller'
import GameController from './Game/GameController'
import PlayerController from './Game/PlayerController'
import VehicleController from './Game/VehicleController'
import { oxmysql as MySQL } from '@overextended/oxmysql'

// load scripts
import './Interactions/exports'
import './Interactions/events'

if (!qbEnv.qbPath) {
  throw new Error(
    `Could not find ${unlEnv.unlQBName} in your resources! Startup abort ...`
  )
}

const CREATE_TABLE =
  'CREATE TABLE IF NOT EXISTS `unl_session_store` (`session_id` varchar(50) NOT NULL, `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `modified` timestamp NULL DEFAULT NULL, `payload` text, PRIMARY KEY (`session_id`)) ENGINE=InnoDB;'
const CHECK_BAN_COLUMN = "SHOW COLUMNS FROM bans LIKE '%tokens%';"
const ADD_BAN_COLUMN = 'ALTER TABLE bans ADD tokens text DEFAULT NULL;'

let setupMode = false

export const setSetupMode = val => {
  setupMode = val
}

export const getSetupMode = () => {
  return setupMode
}

export const setupToken = customAlphabet(dict51, 48)()

// general
export const Database = new DatabaseController()

// fivem
export const Game = new GameController()
export const Players = new PlayerController()
export const Vehicles = new VehicleController()

Database.init().then(async () => {
  // create toke if not mysql store
  if (!unlEnv.unlMySQLSessions) {
    await Database.updateConfigValue(
      'tokenSecret',
      customAlphabet(dict51, 20)(),
      !setupMode
    )
  }

  // create table if mysql store & create token if not persistent
  if (unlEnv.unlMySQLSessions) {
    await MySQL.query(CREATE_TABLE)

    if (!Database.getConfigValue('tokenSecret'))
      await Database.updateConfigValue(
        'tokenSecret',
        customAlphabet(dict51, 20)(),
        !setupMode
      )
  }

  // create ban column token if missing
  const columns = await MySQL.query(CHECK_BAN_COLUMN)
  if (columns.length === 0) {
    await MySQL.query(ADD_BAN_COLUMN)
  }

  if (getSetupMode()) {
    UnlLogger.info('Setup Mode detected.', { discord: false })
    UnlLogger.info('Generated Setup Token.', { discord: false })
    console.log(
      '\n',
      '#################################################################',
      '\n',
      `# Setup Token: ${setupToken} #`,
      '\n',
      '#################################################################',
      '\n'
    )
  }
  const { default: Webserver } = await import('./Web/Webserver')

  const unlimitedWeb = new Webserver()

  on(`${unlEnv.unlQBObject}:Server:UpdateObject`, Game.updateQBCore.bind(Game))
  on(
    `${unlEnv.unlQBObject}:Player:SetPlayerData`,
    unlimitedWeb.webSocket.updatePlayer.bind(unlimitedWeb.webSocket)
  )
  on(
    `unlimited::update::playerInv`,
    unlimitedWeb.webSocket.updatePlayer.bind(unlimitedWeb.webSocket)
  )
  on(
    `unlimited::update::supStash`,
    unlimitedWeb.webSocket.updateSupStash.bind(unlimitedWeb.webSocket)
  )

  onNet(
    `inventory:server:SaveInventory`,
    unlimitedWeb.webSocket.checkStorageUpdate.bind(unlimitedWeb.webSocket)
  )
  on(
    `unlimited::update::storage`,
    unlimitedWeb.webSocket.updateStorage.bind(unlimitedWeb.webSocket)
  )

  global.exports[unlEnv.resourceName].initLua(
    unlEnv.unlQBName,
    unlEnv.unlQBObject
  )
})
