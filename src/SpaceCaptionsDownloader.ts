import fs from 'fs'
import winston from 'winston'
import { PeriscopeApi } from './apis/PeriscopeApi'
import { logger as baseLogger } from './logger'

export class SpaceCaptionsDownloader {
  private readonly API_PATH = 'chatapi/v1/history'

  private logger: winston.Logger

  private chunkCount = 1
  private cursor = ''

  constructor(
    private spaceId: string,
    private endpoint: string,
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
        try {
          this.logger.info(`Downloading chunk ${this.chunkCount}`)
          this.logger.debug(`Current cursor: "${this.cursor}"`)
          // eslint-disable-next-line no-await-in-loop
          const history = await PeriscopeApi.getChatHistory(
            this.endpoint,
            this.spaceId,
            this.accessToken,
            this.cursor,
          )
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
}
