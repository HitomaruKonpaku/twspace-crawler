import fs from 'fs'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { logger as baseLogger } from '../logger'

export class SpaceCaptionsDownloader {
  private logger: winston.Logger

  private chunkCount = 1
  private cursor = ''
  private msgCountAll = 0

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
    this.logger.info(`Downloading chat to "${this.file}"`)
    fs.mkdirSync(path.dirname(this.file), { recursive: true })
    fs.writeFileSync(this.file, '')
    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { messages, cursor } = await this.getChatHistory()
        messages?.forEach?.((message) => {
          fs.appendFileSync(this.file, `${JSON.stringify(message)}\n`)
        })
        this.chunkCount += 1
        this.cursor = cursor
      } catch (error) {
        const msg = error.message as string
        const status = error.response?.status
        if (status === 503) {
          break
        }
        if (!['socket hang up', 'connect ETIMEDOUT'].some((v) => msg.includes(v))) {
          break
        }
      }
    } while (this.cursor || this.chunkCount <= 1)
    this.logger.info(`Chat downloaded to "${this.file}"`)
  }

  private async getChatHistory() {
    this.logger.debug('--> getChatHistory', { chunkCount: this.chunkCount, cursor: this.cursor })
    try {
      const history = await PeriscopeApi.getChatHistory(this.endpoint, this.spaceId, this.accessToken, this.cursor)
      const { messages } = history
      const msgCount = messages?.length || 0
      this.msgCountAll += msgCount
      this.logger.debug('<-- getChatHistory', { msgCount, msgCountAll: this.msgCountAll })
      return history
    } catch (error) {
      this.logger.error(`getChatHistory: ${error.message}`, { cursor: this.cursor })
      throw error
    }
  }
}
