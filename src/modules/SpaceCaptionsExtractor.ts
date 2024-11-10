import fs from 'fs'
import readline from 'readline'
import winston from 'winston'
import { MessageKind } from '../enums/Periscope.enum'
import { ChatHistoryMessage, ChatMessage, ChatMessageData } from '../interfaces/Periscope.interface'
import { logger as baseLogger } from '../logger'
import { Util } from '../utils/Util'

export class SpaceCaptionsExtractor {
  private logger: winston.Logger

  constructor(
    private inpFile: string,
    private outFile?: string,
    private startedAt?: number,
  ) {
    this.logger = baseLogger.child({ label: '[SpaceCaptionsExtractor]' })

    this.inpFile = inpFile
    this.outFile = outFile === inpFile
      ? `${outFile}.txt`
      : (outFile || `${inpFile}.txt`)
  }

  public async extract() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (!fs.existsSync(this.inpFile)) {
          this.logger.warn(`Input file not found at ${this.inpFile}`)
          return
        }
        fs.writeFileSync(this.outFile, '')
        await this.processFile()
        resolve(this.outFile)
      } catch (error) {
        this.logger.error(error.message)
        reject(error)
      }
    })
  }

  private async processFile() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
      this.logger.info(`Loading captions from ${this.inpFile}`)
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
        this.logger.info(`Captions saved to ${this.outFile}`)
        resolve()
      })
    })
  }

  private processLine(payload: string) {
    const obj = JSON.parse(payload) as ChatHistoryMessage
    if (obj.kind !== MessageKind.CHAT) {
      return
    }
    this.processChat(obj.payload)
  }

  private processChat(payload: string) {
    const obj = JSON.parse(payload) as ChatMessage
    if (!obj.uuid) {
      return
    }
    this.processChatData(obj.body)
  }

  private processChatData(payload: string) {
    const obj = JSON.parse(payload) as ChatMessageData
    if (!obj.final || !obj.body) {
      return
    }
    const time = this.startedAt
      ? `${Util.getDisplayTime(Math.max(0, obj.timestamp - this.startedAt))} | `
      : ''
    const msg = `${time}${obj.username}: ${obj.body.trim()}\n`
    fs.appendFileSync(this.outFile, msg)
  }
}
