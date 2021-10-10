import path from 'path'
import winston, { format } from 'winston'
import { config } from './config'

export default winston.createLogger({
  format: format.combine(
    format(info => {
      info.level = info.level.toUpperCase()
      return info
    })(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: format.combine(format.colorize(), getConsoleFormat()),
    }),
    new winston.transports.File({
      level: 'debug',
      filename: getFileName(),
      format: format.combine(getFileFormat()),
    }),
    new winston.transports.File({
      level: 'silly',
      filename: getFileNameAll(),
      format: format.combine(getFileFormat()),
    }),
  ],
})

function getConsoleFormat() {
  return format.printf((info) => {
    const date = new Date().toISOString()
    const msg = `${date} ${info.level} ${typeof info.message === 'string' ? info.message : JSON.stringify(info.message)}`
    return msg
  })
}

function getFileName(): string {
  const date = new Date()
  const fileName = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(v => String(v).padStart(2, '0'))
    .join('') + '.log'
  const filePath = path.join(__dirname, config.app.logDir, fileName)
  return filePath
}

function getFileNameAll(): string {
  const date = new Date()
  const fileName = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(v => String(v).padStart(2, '0'))
    .join('') + '_all' + '.log'
  const filePath = path.join(__dirname, config.app.logDir, fileName)
  return filePath
}

function getFileFormat() {
  return getConsoleFormat()
}
