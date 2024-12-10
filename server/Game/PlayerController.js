import { Game } from '../index'
import { UnlLogger } from '../Logging/UnlLogger'

export default class PlayerController {
  constructor() {
    UnlLogger.info('Successfully started PlayerController', { discord: false })
  }

  GetLiveMapPlayer() {
    const playerSources = Game.getPlayers()
    let playerObject = []

    playerSources.forEach(src => {
      const ped = GetPlayerPed(src)
      const coords = GetEntityCoords(ped, false)
      const QBPlayer = Game.QBCore.Functions.GetPlayer(src)
      const name = `${QBPlayer.PlayerData.charinfo.firstname} ${QBPlayer.PlayerData.charinfo.lastname}`

      playerObject.push({
        source: src,
        name: name,
        coords: { x: coords[0], y: coords[1] },
        citizenid: QBPlayer.PlayerData.citizenid,
      })
    })

    return playerObject
  }
}
