import axios from 'axios'
import fs from 'fs'
import winston from 'winston'
import { ChatHistory } from './interfaces/Periscope.interface'
import { logger as baseLogger } from './logger'

export class SpaceCaptionsDownloader {
  private readonly API_URL = 'https://prod-chatman-ancillary-ap-northeast-1.pscp.tv/chatapi/v1/history'

  private logger: winston.Logger

  private count = 0
  private cursor = ''

  constructor(
    private spaceId: string,
    private accessToken: string,
    private file?: string,
  ) {
    this.logger = baseLogger.child({ label: `[SpaceCaptionsDownloader@${spaceId}]` })
    this.file = this.file || `${new Date().toISOString().replace(/[^\d]/g, '').substring(2, 14)} (${spaceId}) CC.jsonl`
  }

  public async download() {
    try {
      this.logger.info(`Downloading captions to ${this.file}`)
      fs.writeFileSync(this.file, '')
      do {
        this.count += 1
        this.logger.info(`Downloading part ${this.count}`)
        // eslint-disable-next-line no-await-in-loop
        const history = await this.getChatHistory()
        const { messages } = history
        messages.forEach((message) => {
          fs.appendFileSync(this.file, `${JSON.stringify(message)}\n`)
        })
        this.cursor = history.cursor
      } while (this.cursor)
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private async getChatHistory() {
    const { data } = await axios.post<ChatHistory>(this.API_URL, {
      room: this.spaceId,
      access_token: this.accessToken,
      cursor: this.cursor,
    })
    return data
  }
}
