import { aimedAtPlayer, gotHitByPlayer } from './logs'
import { checkPlayerBan } from './ban'
import { unlEnv } from '../globalData'

// logging
if (unlEnv.config.disableWeaponLogs !== 'true') {
  on('weaponDamageEvent', gotHitByPlayer)
  onNet('unlimited::spectre::aimedAtPlayer', aimedAtPlayer)
}

on('playerConnecting', checkPlayerBan)
