import fs from 'fs'
import path from 'path'
import winston from 'winston'
import { SpaceCaptionsChat, SpaceCaptionsDownloaderResult, SpaceCaptionsExtractorOptions } from '../interfaces/space-captions.interface'
import { logger as baseLogger } from '../logger'
import { TimeUtil } from '../utils/time.util'
import { userManager } from './user-manager'

/**
 * Extracts the captions of a Space from a downloaded chat JSON file.
 *
 * Handles the live-chat JSON format. Replaces the Periscope chat history extractor.
 * Writes one line per chatType 45 chat in the format `[HH:MM:SS | ]username: message`.
 */
export class SpaceCaptionsExtractor {
  private logger: winston.Logger
  private outFile: string

  private readonly users: Map<string, string> = new Map()

  constructor(private readonly options: SpaceCaptionsExtractorOptions) {
    this.logger = baseLogger.child({ label: '[SpaceCaptionsExtractor]' })
    const { inpFile, outFile } = options
    this.outFile = outFile === inpFile
      ? `${outFile}.txt`
      : (outFile || `${inpFile}.txt`)
  }

  /**
   * Loads the chat JSON file and saves the captions to the output file.
   */
  public extract() {
    try {
      const result = this.loadFile()
      this.logger.info(`Loading captions from "${this.options.inpFile}"`)
      this.updateLogger(result)
      const content = this.buildContent(result)
      this.saveFile(content)
      this.logger.info(`Captions saved to "${this.outFile}"`)
    } catch (error) {
      this.logger.error(`extract: ${error.message}`)
    }
  }

  private updateLogger(result: SpaceCaptionsDownloaderResult) {
    const spaceId = result.metadata.audioSpace?.rest_id
      || result.metadata.audioSpace?.metadata?.rest_id
      || result.spaceId
    if (!spaceId) {
      return
    }
    this.logger = baseLogger.child({ label: `[SpaceCaptionsExtractor@${spaceId}]` })
  }

  private loadFile() {
    const result = JSON.parse(fs.readFileSync(this.options.inpFile, 'utf8')) as SpaceCaptionsDownloaderResult
    return result
  }

  private buildContent(result: SpaceCaptionsDownloaderResult) {
    this.addUsers(result)
    const startedAt = result.metadata.audioSpace?.metadata?.started_at
    const chats = this.filterChats(result.chats)
    const content = chats
      .map((chat) => this.buildLine(chat, startedAt))
      .join('')
    return content
  }

  private buildLine(chat: SpaceCaptionsChat, startedAt?: number) {
    const time = this.getTime(chat, startedAt)
    const username = this.users.get(chat.userId)
      || userManager.getUserById(chat.userId)?.username
      || `[${chat.userId}]`
    const prefix = time
      ? `${time} | `
      : ''
    const line = `${prefix}${username}: ${chat.message.trim()}\n`
    return line
  }

  private filterChats(chats: SpaceCaptionsChat[]) {
    const result = chats.filter((chat) => this.isCaptionChat(chat))
    this.logger.debug('Caption chats', { chatCount: result.length })
    return result
  }

  private isCaptionChat(chat: SpaceCaptionsChat) {
    const result = chat.chatType === 45 && !!chat.message
    return result
  }

  private saveFile(content: string) {
    fs.mkdirSync(path.dirname(this.outFile), { recursive: true })
    fs.writeFileSync(this.outFile, content)
  }

  private addUsers(result: SpaceCaptionsDownloaderResult) {
    const participants = result.metadata.audioSpace?.participants
    const all = [
      ...(participants?.admins || []),
      ...(participants?.speakers || []),
      ...(participants?.listeners || []),
    ]
    all.forEach((v) => {
      const id = v.user_results?.rest_id || v.periscope_user_id?.replace(/^tw-/, '')
      if (id) {
        this.users.set(id, v.twitter_screen_name)
      }
    })
    result.metadata.extraUsers?.forEach((v) => {
      if (!this.users.has(v.id)) {
        this.users.set(v.id, v.username)
      }
    })
    const users = Object.fromEntries(this.users)
    this.logger.debug('Users loaded', { userCount: this.users.size, users })
  }

  private getTime(chat: SpaceCaptionsChat, startedAt?: number): string {
    if (!startedAt) {
      return ''
    }
    const ms = Number(BigInt(chat.ts) / 1000000n) - startedAt
    const time = TimeUtil.getDisplayTime(Math.max(0, ms))
    return time
  }
}
