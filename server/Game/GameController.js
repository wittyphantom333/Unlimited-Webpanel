import fs from 'fs'
import { qbEnv, unlEnv } from '../globalData'
import { format } from '../Utils/lua.format'
import { UnlLogger } from '../Logging/UnlLogger'

export default class GameController {
  constructor() {
    this.QBCore = global.exports[unlEnv.unlQBName].GetCoreObject()
    this.Items = global.exports[unlEnv.resourceName].loadSharedFile(
      unlEnv.unlQBName,
      'items',
      `${unlEnv.unlQBShared}.Items`
    )
    UnlLogger.info('Successfully loaded Items', { discord: false })

    let TempJobs = global.exports[unlEnv.resourceName].loadSharedFile(
      unlEnv.unlQBName,
      'jobs',
      unlEnv.unlQBShared
    )
    this.Jobs = TempJobs.Jobs
    this.ForceJobDefaultDutyAtLogin = TempJobs.ForceJobDefaultDutyAtLogin
    TempJobs = null
    UnlLogger.info('Successfully loaded Jobs', { discord: false })

    this.Gangs = global.exports[unlEnv.resourceName].loadSharedFile(
      unlEnv.unlQBName,
      'gangs',
      `${unlEnv.unlQBShared}.Gangs`
    )
    UnlLogger.info('Successfully loaded Gangs', { discord: false })

    this.Vehicles = global.exports[unlEnv.resourceName].loadSharedFile(
      unlEnv.unlQBName,
      'vehicles',
      `${unlEnv.unlQBShared}.Vehicles`
    )
    UnlLogger.info('Successfully loaded Vehicles', { discord: false })

    UnlLogger.info('Successfully started GameController', { discord: false })
  }

  updateQBCore() {
    this.QBCore = global.exports[unlEnv.unlQBName].GetCoreObject()
  }

  getItem(itemId) {
    return this.Items[itemId]
  }

  getItems() {
    return this.Items
  }

  async updateItem(itemName, item) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].UpdateItem(
      itemName.toLowerCase(),
      item
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    this.Items[itemName.toLowerCase()] = item
    const { resCode, resMsg } = await this.saveItems()

    return { resCode: resCode, resMsg: resMsg }
  }

  async addItem(itemName, item) {
    const [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].AddItem(
      itemName.toLowerCase(),
      item
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    this.Items[itemName.toLowerCase()] = item
    const { resCode, resMsg } = await this.saveItems()

    return { resCode: resCode, resMsg: resMsg }
  }

  async deleteItem(itemName) {
    const [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].RemoveItem(
      itemName.toLowerCase()
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete this.Items[itemName.toLowerCase()]
    const { resCode, resMsg } = await this.saveItems()

    return { resCode: resCode, resMsg: resMsg }
  }

  getJob(jobId) {
    return this.Jobs[jobId]
  }

  getJobs() {
    return this.Jobs
  }

  async updateJob(jobName, job) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].UpdateJob(
      jobName.toLowerCase(),
      job
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    this.Jobs[jobName.toLowerCase()] = job

    const { resCode, resMsg } = await this.saveJobs()

    return { resCode: resCode, resMsg: resMsg }
  }

  async addJob(jobName, job) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].AddJob(
      jobName.toLowerCase(),
      job
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete job.name
    this.Jobs[jobName.toLowerCase()] = job

    const { resCode, resMsg } = await this.saveJobs()

    return { resCode: resCode, resMsg: resMsg }
  }

  async deleteJob(jobName) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].RemoveJob(
      jobName.toLowerCase()
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete this.Jobs[jobName.toLowerCase()]

    const { resCode, resMsg } = await this.saveJobs()

    return { resCode: resCode, resMsg: resMsg }
  }

  getGang(gangId) {
    return this.Gangs[gangId]
  }

  getGangs() {
    return this.Gangs
  }

  async updateGang(gangName, gang) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].UpdateGang(
      gangName.toLowerCase(),
      gang
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    this.Gangs[gangName.toLowerCase()] = gang

    const { resCode, resMsg } = await this.saveGangs()

    return { resCode: resCode, resMsg: resMsg }
  }

  async addGang(gangName, gang) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].AddGang(
      gangName.toLowerCase(),
      gang
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete gang.name
    this.Gangs[gangName.toLowerCase()] = gang

    const { resCode, resMsg } = await this.saveGangs()

    return { resCode: resCode, resMsg: resMsg }
  }

  async deleteGang(gangName) {
    let [resCodeQB, resMsgQB] = global.exports[unlEnv.unlQBName].RemoveGang(
      gangName.toLowerCase()
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete this.Gangs[gangName.toLowerCase()]

    const { resCode, resMsg } = await this.saveGangs()

    return { resCode: resCode, resMsg: resMsg }
  }

  getPlayers() {
    return this.QBCore.Functions.GetPlayers()
  }

  getVehicle(vehicleId) {
    return this.Vehicles[vehicleId]
  }

  getVehicles() {
    return this.Vehicles
  }

  async updateVehicle(vehName, veh) {
    let [resCodeQB, resMsgQB] = this.QBCore.Functions.UpdateVehicle(
      vehName.toLowerCase(),
      veh
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    veh.hash = GetHashKey(vehName)
    this.Vehicles[vehName.toLowerCase()] = veh

    const { resCode, resMsg } = await this.saveVehicles()

    return { resCode: resCode, resMsg: resMsg }
  }

  async addVehicle(vehName, veh) {
    let [resCodeQB, resMsgQB] = this.QBCore.Functions.AddVehicle(
      vehName.toLowerCase(),
      veh
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    veh.hash = GetHashKey(vehName)
    this.Vehicles[vehName.toLowerCase()] = veh

    const { resCode, resMsg } = await this.saveVehicles()

    return { resCode: resCode, resMsg: resMsg }
  }

  async deleteVehicle(vehName) {
    let [resCodeQB, resMsgQB] = this.QBCore.Functions.RemoveVehicle(
      vehName.toLowerCase()
    )
    if (!resCodeQB) return { resCode: resCodeQB, resMsg: resMsgQB }

    delete this.Vehicles[vehName.toLowerCase()]

    const { resCode, resMsg } = await this.saveVehicles()

    return { resCode: resCode, resMsg: resMsg }
  }

  async saveItems() {
    try {
      await fs.promises.writeFile(
        `${qbEnv.qbPath}/shared/items.lua`,
        `${unlEnv.unlQBShared} = ${unlEnv.unlQBShared} or {}\n\n${
          unlEnv.unlQBShared
        }.Items = ${format(this.Items)}`
      )

      return { resCode: true, resMsg: 'success' }
    } catch (e) {
      UnlLogger.error(e)
      return { resCode: false, resMsg: 'file_error' }
    }
  }

  async saveJobs() {
    try {
      await fs.promises.writeFile(
        `${qbEnv.qbPath}/shared/jobs.lua`,
        `${unlEnv.unlQBShared} = ${unlEnv.unlQBShared} or {}\n${
          unlEnv.unlQBShared
        }.ForceJobDefaultDutyAtLogin = ${
          this.ForceJobDefaultDutyAtLogin
        } -- true: Force duty state to jobdefaultDuty | false: set duty state from database last saved\n\n${
          unlEnv.unlQBShared
        }.Jobs = ${format(this.Jobs)}`
      )

      return { resCode: true, resMsg: 'success' }
    } catch (e) {
      UnlLogger.error(e)
      return { resCode: false, resMsg: 'file_error' }
    }
  }

  async saveGangs() {
    try {
      await fs.promises.writeFile(
        `${qbEnv.qbPath}/shared/gangs.lua`,
        `${unlEnv.unlQBShared} = ${unlEnv.unlQBShared} or {}\n\n${
          unlEnv.unlQBShared
        }.Gangs = ${format(this.Gangs)}`
      )

      return { resCode: true, resMsg: 'success' }
    } catch (e) {
      UnlLogger.error(e)
      return { resCode: false, resMsg: 'file_error' }
    }
  }

  async saveVehicles() {
    try {
      const tmpVeh = JSON.parse(JSON.stringify(this.Vehicles))
      for (const [key, value] of Object.entries(tmpVeh)) {
        value.hash = '`' + key + '`'
      }

      await fs.promises.writeFile(
        `${qbEnv.qbPath}/shared/vehicles.lua`,
        `${unlEnv.unlQBShared} = ${unlEnv.unlQBShared} or {}\n${
          unlEnv.unlQBShared
        }.VehicleHashes = {}\n\n${unlEnv.unlQBShared}.Vehicles = ${format(
          tmpVeh
        )}\n\nfor _, v in pairs(${unlEnv.unlQBShared}.Vehicles) do\n\t${
          unlEnv.unlQBShared
        }.VehicleHashes[v.hash] = v\nend\n`
      )

      return { resCode: true, resMsg: 'success' }
    } catch (e) {
      UnlLogger.error(e)
      return { resCode: false, resMsg: 'file_error' }
    }
  }
}
