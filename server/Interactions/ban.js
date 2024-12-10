import { oxmysql as MySQL } from '@overextended/oxmysql'
import { unlEnv } from '../globalData'

const checkPlayerBan = async (name, setKickReason, deferrals) => {
  deferrals.defer()

  const source = global.source
  const playerTokens = global.exports[unlEnv.resourceName].getHWID(source)
  const banned = await MySQL.query(
    'SELECT id, expire, reason, bannedby FROM bans WHERE tokens = ?;',
    [playerTokens]
  )

  const timestamp = global.exports[unlEnv.resourceName].getOsTime()

  // has bans
  if (banned.length > 0) {
    banned.forEach(ban => {
      // ban active
      if (timestamp < ban.expire) {
        deferrals.done(
          `Banned by "${ban.bannedby}" for "${
            ban.reason ? ban.reason : 'No reason given'
          }" until ${new Date(ban.expire * 1000)}`
        )
      } else {
        MySQL.query('DELETE FROM bans WHERE id = ?', [ban.id])
      }
    })
  }

  deferrals.done()
}

export { checkPlayerBan }
