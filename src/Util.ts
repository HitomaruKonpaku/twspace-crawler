import axios from 'axios'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import { APP_CACHE_DIR, APP_MEDIA_DIR, APP_USER_REFRESH_INTERVAL } from './constants/app.constant'
import { AccessChat } from './interfaces/Periscope.interface'
import { logger as baseLogger } from './logger'
import { TwitterApi } from './TwitterApi'

const logger = baseLogger.child({ label: '[Util]' })

export class Util {
  public static getTwitterAuthorization(): string {
    return process.env.TWITTER_AUTHORIZATION
  }

  public static getTimeString(): string {
    const date = new Date()
    const s = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ].map((v) => String(v).padStart(2, '0').slice(-2)).join('')
    return s
  }

  public static getExternalConfig(): Record<string, any> {
    const config = {}
    const configPath = program.getOptionValue('config')
    if (configPath) {
      try {
        Object.assign(config, JSON.parse(fs.readFileSync(configPath, 'utf-8')))
      } catch (error) {
        logger.error(`Failed to read config: ${error.message}`)
      }
    }
    return config
  }

  public static getUserRefreshInterval(): number {
    return Number(Util.getExternalConfig().interval) || APP_USER_REFRESH_INTERVAL
  }

  public static getCacheDir(subDir = ''): string {
    return path.join(__dirname, APP_CACHE_DIR, subDir)
  }

  public static createCacheDir(subDir = ''): string {
    return fs.mkdirSync(this.getCacheDir(subDir), { recursive: true })
  }

  public static getMediaDir(subDir = ''): string {
    return path.join(__dirname, APP_MEDIA_DIR, subDir)
  }

  public static createMediaDir(subDir = ''): string {
    return fs.mkdirSync(this.getMediaDir(subDir), { recursive: true })
  }

  public static async getAccessChatData(chatToken: string) {
    const { data } = await axios.post<AccessChat>(
      'https://proxsee.pscp.tv/api/v2/accessChatPublic',
      { chat_token: chatToken },
    )
    return data
  }

  public static getMasterUrlFromDynamicUrl(dynamicUrl: string): string {
    const masterUrl = dynamicUrl
      .replace('?type=live', '')
      .replace('dynamic', 'master')
    return masterUrl
  }

  public static async getDynamicUrl(
    mediaKey: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    const data = await TwitterApi.getLiveVideoStreamStatus(mediaKey, headers)
    const dynamicUrl: string = data.source.location
    return dynamicUrl
  }

  public static async getMasterUrl(
    mediaKey: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    return this.getMasterUrlFromDynamicUrl(await this.getDynamicUrl(mediaKey, headers))
  }

  public static getChunks(data: string): number[] {
    const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_a\.)/gm
    return data.match(chunkIndexPattern)?.map((v) => Number(v)) || []
  }
}
