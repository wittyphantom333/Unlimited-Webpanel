import winston from 'winston'
import { unlEnv } from '../../globalData'
import { timestamp } from '../LoggerUtils'
import DiscordTransport from '../../Middleware/discord.transport'

let transports = [
  new winston.transports.File({
    filename: unlEnv.loggerPaths.game,
  }),
]

if (unlEnv.unlGameDiscordHook)
  transports.push(
    new DiscordTransport({
      webhook: unlEnv.unlGameDiscordHook,
      defaultMeta: { Service: 'Spectre', Logger: 'Game' },
    })
  )

export const gameLogger = winston.createLogger({
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
