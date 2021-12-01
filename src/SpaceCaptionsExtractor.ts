import fs from 'fs'
import readline from 'readline'
import winston from 'winston'
import { logger as baseLogger } from './logger'
import { Periscope } from './namespaces/Periscope'

export class SpaceCaptionsExtractor {
  private logger: winston.Logger
  private inpFile: string
  private outFile: string

  constructor() {
    this.logger = baseLogger.child({ label: '[SpaceCaptionsExtractor]' })
  }

  public extract(inpFile: string, outFile?: string) {
    this.inpFile = inpFile
    this.outFile = outFile === inpFile
      ? `${outFile}.txt`
      : (outFile || `${inpFile}.txt`)
    this.processFile()
  }

  private processFile() {
    if (!fs.existsSync(this.inpFile)) {
      this.logger.warn(`Temp chat file not found at ${this.inpFile}`)
      return
    }
    this.logger.info(`Loading chat from ${this.inpFile}`)
    const fileStream = fs.createReadStream(this.inpFile)
    const rl = readline.createInterface({ input: fileStream })
    let lineCount = 0
    rl.on('line', (line) => {
      lineCount += 1
      try {
        this.processLine(line)
      } catch (error) {
        this.logger.error(`Failed to process line ${lineCount}: ${error.message}`)
      }
    })
    rl.once('close', () => {
      this.logger.info(`Chat saved to ${this.outFile}`)
    })
  }

  private processLine(payload: string) {
    const obj = JSON.parse(payload)
    if (obj.kind !== Periscope.MessageKind.CHAT) {
      return
    }
    this.processChat(obj.payload)
  }

  private processChat(payload: string) {
    const obj = JSON.parse(payload)
    if (!obj.uuid) {
      return
    }
    this.processChatData(obj.body)
  }

  private processChatData(payload: string) {
    const obj = JSON.parse(payload)
    if (!obj.final || !obj.body) {
      return
    }
    const msg = `${obj.username}: ${obj.body}\n`
    fs.appendFileSync(this.outFile, msg)
  }
}
