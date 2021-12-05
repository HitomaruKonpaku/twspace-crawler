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
        this.logger.info(`Downloading chunk ${this.chunkCount}`)
        // eslint-disable-next-line no-await-in-loop
        const history = await this.getChatHistory()
        const { messages } = history
        messages.forEach((message) => {
          fs.appendFileSync(this.file, `${JSON.stringify(message)}\n`)
        })
        this.chunkCount += 1
        this.cursor = history.cursor
      } while (this.cursor)
    } catch (error) {
      this.logger.error(error.message)
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
