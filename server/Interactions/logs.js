import { Game } from '../index'
import { UnlLogger } from '../Logging/UnlLogger'
import { gameLogger } from '../Logging/Modules/GameLogger'
import { playerLogger } from '../Logging/Modules/PlayerLogger'
import { unlEnv } from '../globalData'

const WEAPONS = JSON.parse(
  LoadResourceFile(GetCurrentResourceName(), 'hashes.json')
)

const gotHitByPlayer = (attackerSource, data) => {
  // ignore unknown/no damage type
  if (data.damageType === 0 || data.damageType === 1) return

  const victims = data.hitGlobalIds
  const weapon = WEAPONS[data.weaponType]

  if (!weapon) {
    UnlLogger.info(
      `Weapon log got triggered with unknow weapon hash ${data.weaponType}. Maybe check your hashes.json`
    )
  }

  const players = Game.getPlayers()

  victims.forEach(victim => {
    let victimSource = null
    let victimPed = null

    players.some(src => {
      const playerPed = GetPlayerPed(src)
      const playerPedNetId = NetworkGetNetworkIdFromEntity(playerPed)

      if (playerPedNetId === victim) {
        victimSource = src
        victimPed = playerPed
        return true
      }
    })

    // skip if unknown
    if (!victimSource || !victimPed) return

    const attackerPlayer = Game.QBCore.Functions.GetPlayer(
      parseInt(attackerSource)
    )
    const victimPlayer = Game.QBCore.Functions.GetPlayer(parseInt(victimSource))

    if (!victimPlayer || !attackerPlayer) {
      UnlLogger.error(
        `Logging player got ${
          willKill ? 'kill' : 'hit'
        } by triggered without victimPlayer or attackerPlayer`
      )
      return
    }

    const victimHealth = GetEntityHealth(victimPed)
    const willKill = victimHealth - data.weaponDamage <= 100

    gameLogger.info(
      `${victimPlayer.PlayerData.charinfo.firstname} ${
        victimPlayer.PlayerData.charinfo.lastname
      } got ${willKill ? 'killed' : 'hit'} by ${
        attackerPlayer.PlayerData.charinfo.firstname
      } ${attackerPlayer.PlayerData.charinfo.lastname} with ${weapon} causing ${
        data.weaponDamage
      } damage.`,
      { discord: unlEnv.config.excludeWeaponLogsFromDiscord === 'false' }
    )
    playerLogger.info(
      `[${victimPlayer.PlayerData.citizenid}] Got ${
        willKill ? 'killed' : 'hit'
      } by ${attackerPlayer.PlayerData.charinfo.firstname} ${
        attackerPlayer.PlayerData.charinfo.lastname
      } (${attackerPlayer.PlayerData.citizenid}) with ${weapon} causing ${
        data.weaponDamage
      } damage.`,
      { discord: unlEnv.config.excludeWeaponLogsFromDiscord === 'false' }
    )
  })
}

const aimedAtPlayer = (targetId, weapon) => {
  const aimingPlayer = Game.QBCore.Functions.GetPlayer(source)
  const targetPlayer = Game.QBCore.Functions.GetPlayer(targetId)

  if (!aimingPlayer || !targetPlayer) {
    UnlLogger.error(
      'Logging player aimed triggered without aimingPlayer or targetPlayer'
    )
    return
  }

  gameLogger.info(
    `${aimingPlayer.PlayerData.charinfo.firstname} ${aimingPlayer.PlayerData.charinfo.lastname} aimed at ${targetPlayer.PlayerData.charinfo.firstname} ${targetPlayer.PlayerData.charinfo.lastname} with ${weapon}.`,
    { discord: unlEnv.config.excludeWeaponLogsFromDiscord === 'false' }
  )
  playerLogger.info(
    `[${aimingPlayer.PlayerData.citizenid}] Aimed at ${targetPlayer.PlayerData.charinfo.firstname} ${targetPlayer.PlayerData.charinfo.lastname} (${targetPlayer.PlayerData.citizenid}) with ${weapon}.`,
    { discord: unlEnv.config.excludeWeaponLogsFromDiscord === 'false' }
  )
}

export { gotHitByPlayer, aimedAtPlayer }
