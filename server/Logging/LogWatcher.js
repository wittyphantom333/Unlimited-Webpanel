import { Tail } from 'tail'
import { unlEnv } from '../globalData'

export default class LogWatcher {
  constructor(webSocket) {
    // unlimited
    this.unlLog = new Tail(unlEnv.loggerPaths.unlimited, {
      useWatchFile: true,
    })
    this.unlLog.on('line', function (line) {
      webSocket.updateLogs('unlimited', line)
    })
    // game
    this.gameLog = new Tail(unlEnv.loggerPaths.game, { useWatchFile: true })
    this.gameLog.on('line', function (line) {
      webSocket.updateLogs('game', line)
    })
    // player
    this.playerLog = new Tail(unlEnv.loggerPaths.player, { useWatchFile: true })
    this.playerLog.on('line', function (line) {
      webSocket.updateLogs('player', line)
    })
    // dev
    this.devLog = new Tail(unlEnv.loggerPaths.dev, { useWatchFile: true })
    this.devLog.on('line', function (line) {
      webSocket.updateLogs('dev', line)
    })
    // web
    this.webLog = new Tail(unlEnv.loggerPaths.web, { useWatchFile: true })
    this.webLog.on('line', function (line) {
      webSocket.updateLogs('web', line)
    })
  }
}
