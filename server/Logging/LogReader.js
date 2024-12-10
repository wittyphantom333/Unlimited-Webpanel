import * as readline from 'node:readline'
import * as fs from 'node:fs'

import { unlEnv } from '../globalData'

export async function getLogFileData(logFile, fromline = null) {
  const inputStream = fs.createReadStream(unlEnv.loggerPaths[logFile])
  const lineReader = readline.createInterface({
    input: inputStream,
    terminal: false,
  })

  const results = []
  for await (const line of lineReader) {
    results.push(line)
  }

  lineReader.close()
  inputStream.destroy()

  const fromlineIndex = results.indexOf(fromline)

  if (results[fromlineIndex] === results[0]) return []

  return fromlineIndex !== -1
    ? results
        .slice(fromlineIndex - 50 >= 0 ? fromlineIndex - 50 : 0, fromlineIndex)
        .reverse()
    : results
        .slice(
          results.length - 50 >= 0 ? results.length - 50 : 0,
          results.length
        )
        .reverse()
}

export async function getPlayerLogs(citizenid, fromline = null) {
  const inputStream = fs.createReadStream(unlEnv.loggerPaths['player'])
  const lineReader = readline.createInterface({
    input: inputStream,
    terminal: false,
  })

  const results = []
  for await (const line of lineReader) {
    results.push(line)
  }

  lineReader.close()
  inputStream.destroy()

  const playerResult = results.filter(function (str) {
    return str.includes(`[${citizenid}]`)
  })

  const fromlineIndex = playerResult.indexOf(fromline)

  if (playerResult[fromlineIndex] === playerResult[0]) return []

  return fromlineIndex !== -1
    ? playerResult
        .slice(fromlineIndex - 50 >= 0 ? fromlineIndex - 50 : 0, fromlineIndex)
        .reverse()
    : playerResult
        .slice(
          playerResult.length - 50 >= 0 ? playerResult.length - 50 : 0,
          playerResult.length
        )
        .reverse()
}

export async function getPlayerBans(citizenid) {
  const inputStream = fs.createReadStream(unlEnv.banFile)
  const lineReader = readline.createInterface({
    input: inputStream,
    terminal: false,
  })

  const results = []
  for await (const line of lineReader) {
    results.push(line)
  }

  lineReader.close()
  inputStream.destroy()

  return results
    .filter(function (str) {
      return str.includes(`[${citizenid}]`)
    })
    .reverse()
}
