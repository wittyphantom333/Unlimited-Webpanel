import { Game } from '../index'

const getOnlineStats = () => {
  const playerSources = Game.getPlayers()
  const jobs = Game.QBCore.Shared.Jobs
  const gangs = Game.QBCore.Shared.Gangs

  let jobDutys = {}
  for (const job of Object.keys(jobs)) {
    jobDutys[jobs[job].label] = Game.QBCore.Functions.GetDutyCount(job)
  }

  let gangsOnline = {}
  for (const gang of Object.keys(gangs)) {
    gangsOnline[gangs[gang].label] = 0
  }

  let players = []
  playerSources.forEach(src => {
    const QBPlayer = Game.QBCore.Functions.GetPlayer(src)

    if (gangsOnline[QBPlayer.PlayerData.gang?.label] !== null)
      gangsOnline[QBPlayer.PlayerData.gang?.label]++

    players.push({
      id: QBPlayer.PlayerData.source,
      name: QBPlayer.PlayerData.name,
      charname: `${QBPlayer.PlayerData.charinfo.firstname} ${QBPlayer.PlayerData.charinfo.lastname}`,
      citizenid: QBPlayer.PlayerData.citizenid,
      job: QBPlayer.PlayerData.job?.label,
      jobGrade: QBPlayer.PlayerData.job?.grade?.name,
      duty: QBPlayer.PlayerData.job?.onduty,
      gang: QBPlayer.PlayerData.gang?.label,
      gangGrade: QBPlayer.PlayerData.gang?.grade?.name,
    })
  })

  return { players, jobDutys, gangsOnline }
}

export { getOnlineStats }
