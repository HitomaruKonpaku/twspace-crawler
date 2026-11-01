import axios from 'axios'
import fs from 'fs'
import path from 'path'
import winston from 'winston'
import { SpaceCaptionsChat, SpaceCaptionsDownloaderOptions, SpaceCaptionsDownloaderResult } from '../interfaces/space-captions.interface'
import { logger as baseLogger } from '../logger'

/**
 * Downloads the chat history of a Space from the live-chat API.
 *
 * Replaces the Periscope chat history API.
 * Saves the chats and the Space metadata to a JSON file.
 */
export class SpaceCaptionsDownloader {
  private logger: winston.Logger
  private file: string

  constructor(private readonly options: SpaceCaptionsDownloaderOptions) {
    this.logger = baseLogger.child({ label: `[SpaceCaptionsDownloader@${options.spaceId}]` })
    this.file = options.file || `${new Date().toISOString().replace(/[^\d]/g, '').substring(2, 14)} (${options.spaceId}) CC.json`
  }

  /**
   * Fetches all chat pages and saves them to the output file.
   */
  public async download() {
    this.logger.info(`Downloading chat to "${this.file}"`)
    const chats = await this.fetchChats()
    this.saveChats(chats)
    this.logger.info(`Chat downloaded to "${this.file}"`)
  }

  private async fetchChats() {
    const chats: SpaceCaptionsChat[] = []
    let cursor: string
    while (true) {
      const page = await this.fetchChatPage(cursor)
      if (!page.length) {
        break
      }
      chats.push(...page)
      cursor = page[page.length - 1].ts
    }
    return chats
  }

  private async fetchChatPage(cursor?: string) {
    this.logger.debug('--> fetchChatPage', { cursor })
    try {
      const url = 'https://api.x.com/live-chat'
      const params: Record<string, string | number> = {
        broadcastId: this.options.spaceId,
        replay: 1,
        cursor,
      }
      const { data } = await axios.get<string>(url, { params })
      const chats = data
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line) as SpaceCaptionsChat)
      this.logger.debug('<-- fetchChatPage', { chatCount: chats.length })
      return chats
    } catch (error) {
      this.logger.error(`fetchChatPage: ${error.message}`, { cursor })
      throw error
    }
  }

  private saveChats(chats: SpaceCaptionsChat[]) {
    const result: SpaceCaptionsDownloaderResult = {
      spaceId: this.options.spaceId,
      chatCount: chats.length,
      chats,
      metadata: {
        audioSpace: this.options.audioSpace,
      },
    }
    fs.mkdirSync(path.dirname(this.file), { recursive: true })
    fs.writeFileSync(this.file, `${JSON.stringify(result, null, 2)}\n`)
  }
}
