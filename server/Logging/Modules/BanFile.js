import winston from 'winston'
import { unlEnv } from '../../globalData'
import { timestamp } from '../LoggerUtils'

export const banFile = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: timestamp,
    }),
    winston.format.printf(info => `[${[info.timestamp]}]: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({
      filename: unlEnv.banFile,
    }),
  ],
})
