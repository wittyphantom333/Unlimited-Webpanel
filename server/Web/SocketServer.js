import osu from 'node-os-utils'
import { Game, Players, Vehicles, Houses } from '../index'
import { unlEnv } from '../globalData'
import { UnlLogger } from '../Logging/UnlLogger'
import { getOnlineStats } from '../Game/Basics'
import { getStorage } from '../Modules/game/stashes/stashes.service'
import { Delay } from '../Utils/delay.utils'

export default class SocketServer {
  constructor(io) {
    this.io = io
    this.pathNampespace = io.of(`/${unlEnv.resourceName}`)

    // start room intervals
    setInterval(this.updateDashboard.bind(this), unlEnv.dashInterval)
    setInterval(this.updateLiveMap.bind(this), unlEnv.liveMapInterval)
  }

  handleConnection(socket) {
    try {
      socket.on('room::join', room => {
        socket.join(room)
        // console.log(`Someone joined ${room}`)
      })

      socket.on('room::leave', room => {
        socket.leave(room)
        // console.log(`Someone left ${room}`)
      })
    } catch (error) {
      UnlLogger.error(`Error handling new Socket connection: ${error.message}`)
      socket.disconnect()
    }
  }

  getRoomMembers(room) {
    const clients = this.io.sockets.adapter.rooms.get(room)
    const nameSpaceCLients = this.pathNampespace.adapter.rooms.get(room)

    return clients ? clients.size : nameSpaceCLients ? nameSpaceCLients.size : 0
  }

  async updateDashboard() {
    if (!this.getRoomMembers('dashboard')) return

    const { players, jobDutys, gangsOnline } = getOnlineStats()

    const data = {
      cpu: await osu.cpu.usage(),
      memory: await osu.mem.info(),
      usage: process.memoryUsage().heapUsed / 1024 / 1024,
      players: players,
      jobDutys: jobDutys,
      gangsOnline: gangsOnline,
    }
    this.io.to('dashboard').emit('dashboard::update', data)
    this.pathNampespace.to('dashboard').emit('dashboard::update', data)
  }

  async updateLiveMap() {
    if (!this.getRoomMembers('livemap')) return

    const playerObject = Players.GetLiveMapPlayer()
    const vehicleObject = await Vehicles.GetLiveMapVehicles()

    const data = {
      players: playerObject,
      vehicles: vehicleObject,
    }

    this.io.to('livemap').emit('livemap::update', data)
    this.pathNampespace.to('livemap').emit('livemap::update', data)
  }

  updateLogs(type, line) {
    if (!this.getRoomMembers(`logs-${type}`)) return

    this.io
      .to(`logs-${type}`)
      .emit(`logs::update`, { type: type, newLine: line })
    this.pathNampespace
      .to(`logs-${type}`)
      .emit(`logs::update`, { type: type, newLine: line })
  }

  updatePlayer(playerData) {
    if (!this.getRoomMembers(`inventory:${playerData.citizenid}`)) return

    this.io
      .to(`inventory:${playerData.citizenid}`)
      .emit(`inventory::${playerData.citizenid}`, { items: playerData.items })
    this.pathNampespace
      .to(`inventory:${playerData.citizenid}`)
      .emit(`inventory::${playerData.citizenid}`, { items: playerData.items })
  }

  updateSupStash(stashData) {
    if (!this.getRoomMembers(`supstash`)) return

    this.io.to(`supstash`).emit(`supstash::update`, { stash: stashData })
    this.pathNampespace
      .to(`supstash`)
      .emit(`supstash::update`, { stash: stashData })
  }

  async checkStorageUpdate(type, identifier) {
    for (const s of unlEnv.config.stashTables) {
      if (s.updateTriggerType === type) {
        await Delay(1000)
        const storageItems = await getStorage(identifier, s)
        this.updateStorage(storageItems, s.type, identifier)
      }
    }
  }

  updateStorage(storageItems, type, identifier) {
    if (!this.getRoomMembers(`storage:${type}:${identifier}`)) return

    this.io
      .to(`storage:${type}:${identifier}`)
      .emit(`storage:${type}:${identifier}`, { items: storageItems })
    this.pathNampespace
      .to(`storage:${type}:${identifier}`)
      .emit(`storage:${type}:${identifier}`, { items: storageItems })
  }
}
