import winston from 'winston'
import { unlEnv } from '../../globalData'
import { timestamp } from '../LoggerUtils'
import DiscordTransport from '../../Middleware/discord.transport'

let transports = [
  new winston.transports.File({
    filename: unlEnv.loggerPaths.web,
  }),
]

if (unlEnv.unlWebDiscordHook)
  transports.push(
    new DiscordTransport({
      webhook: unlEnv.unlWebDiscordHook,
      defaultMeta: { Service: 'Spectre', Logger: 'Web' },
    })
  )

export const webLogger = winston.createLogger({
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
