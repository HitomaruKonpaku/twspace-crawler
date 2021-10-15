import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from './config'

function getPrintFormat() {
  return format.printf((info) => (Object.keys(info.metadata).length
    ? `${info.timestamp} | [${info.level}] ${[info.label, info.message].filter((v) => v).join(' ')} | ${JSON.stringify(info.metadata)}`
    : `${info.timestamp} | [${info.level}] ${[info.label, info.message].filter((v) => v).join(' ')}`))
}

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
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
