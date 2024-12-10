import { gameLogger } from '../Logging/Modules/GameLogger'
import { UnlLogger } from '../Logging/UnlLogger'
import { playerLogger } from '../Logging/Modules/PlayerLogger'
import { oxmysql as MySQL } from '@overextended/oxmysql'

const types = ['info', 'error', 'warn', 'debug']

function gameLog(type, msg = 'No Message') {
  const res = GetInvokingResource()
  if (!types.includes(type)) {
    UnlLogger.error(
      `[GameLogger] Resource "${res}" called unknown log type "${type}"`
    )
    return
  }

  gameLogger.log(type, `[${res}] ${msg}`)
}

const playerLog = (cId, type, msg = 'No Message') => {
  const res = GetInvokingResource()
  if (!types.includes(type)) {
    UnlLogger.error(
      `[PlayerLogger] Resource "${res}" called unknown log type "${type}"`
    )
    return
  }

  MySQL.scalar('SELECT 1 FROM players WHERE citizenid = ?', [cId], result => {
    if (!result) {
      UnlLogger.error(
        `[PlayerLogger] Resource "${res}" called player log with unused citizenId "${cId}"`
      )
      return
    }

    playerLogger.log(type, `[${res}][${cId}] ${msg}`)
  }).catch(console.error)
}

global.exports('GameLog', gameLog)
global.exports('PlayerLog', playerLog)

UnlLogger.info('Successfully registered Exports', { discord: false })
