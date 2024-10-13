import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { LOGGER_DATE_PATTERN, LOGGER_DIR } from './constants/logger.constant'

function getPrintFormat() {
  return format.printf((info) => (Object.keys(info.metadata).length
    ? `${info.timestamp} | [${info.level}] ${[info.label, info.message].filter((v) => v).join(' ')} | ${JSON.stringify(info.metadata)}`
    : `${info.timestamp} | [${info.level}] ${[info.label, info.message].filter((v) => v).join(' ')}`))
}

function getFileName() {
  return `${process.env.NODE_ENV || 'dev'}.%DATE%`
}

const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'verbose',
  format: format.combine(
    format.colorize(),
    getPrintFormat(),
  ),
})

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
    consoleTransport,
    new DailyRotateFile({
      level: 'verbose',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}.log`,
    }),
    new DailyRotateFile({
      level: 'error',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}_error.log`,
    }),
    new DailyRotateFile({
      level: 'silly',
      format: format.combine(getPrintFormat()),
      datePattern: LOGGER_DATE_PATTERN,
      dirname: LOGGER_DIR,
      filename: `${getFileName()}_all.log`,
    }),
  ],
})

const spaceLogger = winston.createLogger({
  format: format.printf((info) => (typeof info.message === 'string' ? info.message : JSON.stringify(info.message))),
  transports: [new winston.transports.File({ dirname: LOGGER_DIR, filename: 'spaces.jsonl' })],
})

const spaceRawLogger = winston.createLogger({
  format: format.printf((info) => (typeof info.message === 'string' ? info.message : JSON.stringify(info.message))),
  transports: [new winston.transports.File({ dirname: LOGGER_DIR, filename: 'spaces.raw.jsonl' })],
})

function toggleDebugConsole() {
  consoleTransport.level = 'debug'
}

export {
  logger,
  spaceLogger,
  spaceRawLogger,
  toggleDebugConsole,
}
