import { createHash } from 'node:crypto'
import * as fs from 'fs'

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import lodash from 'lodash'

import { customAlphabet } from 'nanoid'
import dict51 from 'nanoid-dictionary/nolookalikes'

import { getSetupMode, setSetupMode } from '../index'
import { getHashedPassword } from '../Modules/system/auth/auth.service'
import { unlEnv } from '../globalData'
import { UnlLogger } from '../Logging/UnlLogger'

const deepClone = data => {
  return JSON.parse(JSON.stringify(data))
}

class LowWithLodash extends Low {
  chain = lodash.chain(this).get('data')
}

const adapter = new JSONFile(unlEnv.configPath)

export default class DatabaseController {
  constructor() {
    this.db = new LowWithLodash(adapter)
    this.adminsFileHash = null
  }

  async init() {
    await this.db.read()

    if (!this.db.data) {
      setSetupMode(true)
      this.db.data = {
        lang: 'en',
        user: [],
        roles: [],
        waypoints: [],
      }
    }

    // temp new value "fix"
    if (!this.db.data.waypoints) {
      this.db.data.waypoints = []
    }

    this.refreshRoutine = setInterval(() => {
      this.checkAdminsFile()
    }, 15000)
  }

  async checkAdminsFile() {
    try {
      if (getSetupMode()) return

      const jsonData = JSON.stringify(this.db.data, null, 2)
      this.adminsFileHash = createHash('sha1').update(jsonData).digest('hex')

      const fileJsonData = fs.readFileSync(unlEnv.configPath, 'utf8')
      const inboundHash = createHash('sha1').update(fileJsonData).digest('hex')

      if (this.adminsFileHash !== inboundHash) {
        UnlLogger.info(
          'The data.json file was modified or deleted by an external source, Unlimited - Spectre will try to restore it.'
        )
        await this.save()
      }
    } catch (e) {
      UnlLogger.error(e)
      await this.save()
    }
  }

  save() {
    return this.db.write()
  }

  async updateConfigValue(key, val, save = true) {
    this.db.data[key] = val
    if (save) await this.save()
  }

  getConfigValue(key) {
    return this.db.data[key]
  }

  // User
  checkCredentials(username, password) {
    return !!this.db.data.user.find(
      user => user.name === username.toLowerCase() && user.password === password
    )
  }

  isUsernameUsed(username) {
    return !!this.db.data.user.find(
      user => user.name === username.toLowerCase()
    )
  }

  async createUser(username, password, isMaster, roleId = null, fxname = '') {
    const isUsed = this.isUsernameUsed(username)
    if (isUsed) return { resCode: false, resMsg: 'user_exist' }

    if (fxname !== '') {
      const user = this.getUserByFx(fxname)

      if (user && user.name !== username.toLowerCase())
        return { resCode: false, resMsg: 'fx_used' }
    }

    const hashedPassword = getHashedPassword(password)

    this.db.data.user.push({
      name: username.toLowerCase(),
      password: hashedPassword,
      isMaster: isMaster,
      roleId: roleId,
      fxname: fxname,
    })

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async updateUser(username, roleId = null, fxname = '') {
    const isUsed = this.isUsernameUsed(username)
    if (!isUsed) return { resCode: false, resMsg: 'user_missing' }

    if (fxname !== '') {
      const user = this.getUserByFx(fxname)

      if (user && user.name !== username.toLowerCase())
        return { resCode: false, resMsg: 'fx_used' }
    }

    this.db.chain
      .get('user')
      .find({ name: username.toLowerCase() })
      .assign({
        roleId: roleId,
        fxname: fxname,
      })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async updatePassword(username, password) {
    const isUsed = this.isUsernameUsed(username)
    if (!isUsed) return { resCode: false, resMsg: 'user_missing' }

    const hashedPassword = getHashedPassword(password)

    this.db.chain
      .get('user')
      .find({ name: username.toLowerCase() })
      .assign({
        password: hashedPassword,
      })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async deleteUser(username) {
    const isUsed = this.isUsernameUsed(username)
    if (!isUsed) return { resCode: false, resMsg: 'user_missing' }

    const curUser = this.db.data.user.find(
      user => user.name === username.toLowerCase()
    )

    if (curUser.isMaster) return { resCode: false, resMsg: 'user_master' }

    this.db.chain
      .get('user')
      .remove(r => {
        return r.name === username.toLowerCase()
      })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  getUser(username, removePassword = true) {
    const user = deepClone(
      this.db.data.user.find(user => user.name === username.toLowerCase())
    )

    return this.db.data.user.find(user => user.name === username.toLowerCase())
  }

  getUserByFx(fxname) {
    return this.db.data.user.find(
      user => user.fxname?.toLowerCase() === fxname.toLowerCase()
    )
  }

  getUsers() {
    const users = deepClone(this.db.data.user)

    return users.map(function (user) {
      delete user.password
      return user
    })
  }

  // Role
  isRolenameUsed(name) {
    return !!this.db.data.roles.find(
      role => role.name.toLowerCase() === name.toLowerCase()
    )
  }

  async createRole(name, desc, permissions, color) {
    const isUsed = this.isRolenameUsed(name)
    if (isUsed) return { resCode: false, resMsg: 'role_exist' }

    this.db.data.roles.push({
      name: name,
      desc: desc,
      permissions: permissions,
      color: color,
    })

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async updateRole(name, desc, permissions, color) {
    const isUsed = this.isRolenameUsed(name)

    if (!isUsed) return { resCode: false, resMsg: 'role_missing' }

    this.db.chain
      .get('roles')
      .find({ name: name })
      .assign({ desc: desc, permissions: permissions, color: color })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async deleteRole(name) {
    const isUsed = this.isRolenameUsed(name)

    if (!isUsed) return { resCode: false, resMsg: 'role_missing' }

    this.db.chain
      .get('roles')
      .remove(r => {
        return r.name === name
      })
      .value()

    this.db.chain
      .get('user')
      .find({ roleId: name })
      .assign({ roleId: null })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  getRole(name) {
    return this.db.data.roles.find(role => role.name === name)
  }

  getRoles() {
    return this.db.data.roles
  }

  hasNote(cId) {
    return !!this.db.data.notes.find(note => note.cId === cId)
  }

  getNote(cId) {
    if (!this.db.data.notes) return ''

    return this.db.data.notes.find(note => note.cId === cId)?.note
  }

  async saveNote(cId, note) {
    if (!this.db.data.notes) this.db.data.notes = []

    if (!this.hasNote(cId) && note !== '') {
      this.db.data.notes.push({
        cId: cId,
        note: note,
      })
    } else if (note === '') {
      this.db.chain
        .get('notes')
        .remove(r => {
          return r.cId === cId
        })
        .value()
    } else {
      this.db.chain
        .get('notes')
        .find({ cId: cId })
        .assign({ note: note })
        .value()
    }

    await this.save()
    return { resCode: true, resMsg: 'success' }
  }

  isWaypointNameUsed(name) {
    return !!this.db.data.waypoints.find(
      waypoint => waypoint.name.toLowerCase() === name.toLowerCase()
    )
  }

  async createWaypoint(name, label, coords) {
    const isUsed = this.isWaypointNameUsed(name)
    if (isUsed) return { resCode: false, resMsg: 'waypoint_exist' }

    this.db.data.waypoints.push({
      name: name,
      label: label,
      coords: coords,
    })

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async updateWaypoint(name, label, coords) {
    const isUsed = this.isWaypointNameUsed(name)
    if (!isUsed) return { resCode: false, resMsg: 'waypoint_missing' }

    this.db.chain
      .get('waypoints')
      .find({ name: name })
      .assign({ label: label, coords: coords })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  async deleteWaypoint(name) {
    const isUsed = this.isWaypointNameUsed(name)
    if (!isUsed) return { resCode: false, resMsg: 'waypoint_missing' }

    this.db.chain
      .get('waypoints')
      .remove(r => {
        return r.name === name
      })
      .value()

    await this.save()

    return { resCode: true, resMsg: 'success' }
  }

  getWaypoint(name) {
    return this.db.data.waypoints.find(
      waypoint => waypoint.name.toLowerCase() === name.toLowerCase()
    )
  }

  getWaypoints() {
    return this.db.data.waypoints
  }
}
