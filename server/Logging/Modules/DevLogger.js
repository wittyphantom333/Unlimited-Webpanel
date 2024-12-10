import winston from 'winston'
import { unlEnv } from '../../globalData'
import { timestamp } from '../LoggerUtils'
import DiscordTransport from '../../Middleware/discord.transport'

let transports = [
  new winston.transports.File({
    filename: unlEnv.loggerPaths.dev,
  }),
]

if (unlEnv.unlDevDiscordHook)
  transports.push(
    new DiscordTransport({
      webhook: unlEnv.unlDevDiscordHook,
      defaultMeta: { Service: 'Spectre', Logger: 'Dev' },
    })
  )

export const devLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: timestamp,
    }),
    winston.format.printf(
      info => `[${info.level}][${[info.timestamp]}]: ${info.message}`
    )
  ),
  transports: transports,
})
