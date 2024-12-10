import winston from 'winston'
import { unlEnv } from '../globalData'
import { devLogger } from './Modules/DevLogger'
import { gameLogger } from './Modules/GameLogger'
import { playerLogger } from './Modules/PlayerLogger'
import { webLogger } from './Modules/WebLogger'
import { banFile } from './Modules/BanFile'
import { timestamp } from './LoggerUtils'
import DiscordTransport from '../Middleware/discord.transport'

let transports = [
  new winston.transports.File({
    filename: `${unlEnv.unlWebResourcePath}/error.log`,
    level: 'error',
  }),
  new winston.transports.File({
    filename: unlEnv.loggerPaths.unlimited,
  }),
  new winston.transports.Console({}),
]

if (unlEnv.unlDiscordHook)
  transports.push(
    new DiscordTransport({
      webhook: unlEnv.unlDiscordHook,
      defaultMeta: { Service: 'Spectre', Logger: 'Unlimited' },
      //  level: 'error',
    })
  )

winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
})

export const UnlLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.label({
      label: `UnlSpectre`,
    }),
    winston.format.timestamp({
      format: timestamp,
    }),
    winston.format.printf(
      info =>
        `[${info.level}][${info.label}][${[info.timestamp]}]: ${info.message}`
    )
  ),
  transports: transports,
})
