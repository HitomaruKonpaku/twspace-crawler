import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from './config'

function getPrintFormat() {
  return format.printf((info) => [
    info.timestamp,
    info.level,
    info.label,
    typeof info.message === 'string' ? info.message : JSON.stringify(info.message),
    Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : '',
  ].filter((v) => v).join(' '))
}

const logger = winston.createLogger({
  format: format.combine(
    format.metadata(),
    format.timestamp(),
    format((info) => Object.assign(info, { level: info.level.toUpperCase() }))(),
    format((info) => {
      const { metadata } = info
      if (metadata.label) {
        Object.assign(info, { label: metadata.label })
        delete metadata.label
      }
      return info
    })(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'verbose',
      format: format.combine(
        format.colorize(),
        getPrintFormat(),
      ),
    }),
    new DailyRotateFile({
      level: 'verbose',
      format: format.combine(getPrintFormat()),
      datePattern: config.logger.datePattern,
      dirname: config.logger.dir,
      filename: '%DATE%.log',
    }),
    new DailyRotateFile({
      level: 'silly',
      format: format.combine(getPrintFormat()),
      datePattern: config.logger.datePattern,
      dirname: config.logger.dir,
      filename: '%DATE%_all.log',
    }),
  ],
})

export { logger }
