import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from './config'

function getConsoleFormat() {
  return format.printf((info) => {
    const date = new Date().toISOString()
    const msg = [
      date,
      info.level,
      typeof info.message === 'string' ? info.message : JSON.stringify(info.message),
    ].filter((v) => v).join(' ')
    return msg
  })
}

function getFileFormat() {
  return getConsoleFormat()
}

const logger = winston.createLogger({
  format: format.combine(
    format((info) => Object.assign(info, { level: info.level.toUpperCase() }))(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'verbose',
      format: format.combine(format.colorize(), getConsoleFormat()),
    }),
    new DailyRotateFile({
      level: 'verbose',
      format: format.combine(getFileFormat()),
      datePattern: config.logger.datePattern,
      dirname: config.logger.dir,
      filename: '%DATE%.log',
    }),
    new DailyRotateFile({
      level: 'silly',
      format: format.combine(getFileFormat()),
      datePattern: config.logger.datePattern,
      dirname: config.logger.dir,
      filename: '%DATE%_all.log',
    }),
  ],
})

export default logger
