import axios from 'axios'
import fs from 'fs'
import winston from 'winston'
import { ChatHistory } from './interfaces/Periscope.interface'
import { logger as baseLogger } from './logger'

export class SpaceCaptionsDownloader {
  private readonly API_PATH = 'chatapi/v1/history'

  private logger: winston.Logger

  private apiUrl: string
  private chunkCount = 1
  private cursor = ''

  constructor(
    private spaceId: string,
    private endpoint: string,
    private accessToken: string,
    private file?: string,
  ) {
    this.logger = baseLogger.child({ label: `[SpaceCaptionsDownloader@${spaceId}]` })
    this.apiUrl = new URL(this.API_PATH, endpoint).href
    this.file = this.file || `${new Date().toISOString().replace(/[^\d]/g, '').substring(2, 14)} (${spaceId}) CC.jsonl`
  }

  public async download() {
    try {
      this.logger.info(`Downloading captions to ${this.file}`)
      fs.writeFileSync(this.file, '')
      do {
        try {
          this.logger.info(`Downloading chunk ${this.chunkCount}`)
          this.logger.debug(`Current cursor: "${this.cursor}"`)
          // eslint-disable-next-line no-await-in-loop
          const history = await this.getChatHistory()
          const { messages } = history
          messages.forEach((message) => {
            fs.appendFileSync(this.file, `${JSON.stringify(message)}\n`)
          })
          this.chunkCount += 1
          this.cursor = history.cursor
          this.logger.debug(`Next cursor: "${this.cursor}"`)
        } catch (error) {
          const msg = error.message
          if (!['socket hang up', 'connect ETIMEDOUT'].some((v) => msg.includes(v))) {
            throw error
          }
          this.logger.error(`download: ${msg}`)
        }
      } while (this.cursor || this.chunkCount <= 1)
    } catch (error) {
      this.logger.error(`download: ${error.message}`)
    }
  }

  private async getChatHistory() {
    const { data } = await axios.post<ChatHistory>(this.apiUrl, {
      room: this.spaceId,
      access_token: this.accessToken,
      cursor: this.cursor,
    })
    return data
  }
}
