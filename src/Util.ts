import axios from 'axios'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import { APP_CACHE_DIR, APP_MEDIA_DIR, APP_USER_REFRESH_INTERVAL } from './constants/app.constant'
import { AccessChat } from './interfaces/Periscope.interface'
import { AudioSpaceMetadata, LiveVideoStreamStatus } from './interfaces/Twitter.interface'
import { logger as baseLogger } from './logger'

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

  public static async getTwitterSpacesByCreatorIds(
    ids: string[],
    headers?: Record<string, string>,
  ) {
    const { data } = await axios.get('https://api.twitter.com/2/spaces/by/creator_ids', {
      headers,
      params: { user_ids: ids.join(',') },
    })
    return data
  }

  public static async getTwitterGuestToken(): Promise<string> {
    const { data } = await axios.get<string>('https://twitter.com/')
    const token = /(?<=gt=)\d{19}/.exec(data)[0]
    return token
  }

  public static async getTwitterSpaceMetadata(
    spaceId: string,
    headers?: Record<string, string>,
  ) {
    const res = await axios.get('https://twitter.com/i/api/graphql/jyQ0_DEMZHeoluCgHJ-U5Q/AudioSpaceById', {
      headers,
      params: {
        variables: {
          id: spaceId,
          isMetatagsQuery: false,
          withSuperFollowsUserFields: false,
          withUserResults: false,
          withBirdwatchPivots: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withReplays: false,
          withScheduledSpaces: false,
        },
      },
    })
    const { metadata } = res.data.data.audioSpace
    return metadata as AudioSpaceMetadata
  }

  public static async getLiveVideoStreamStatus(
    mediaKey: string,
    headers?: Record<string, string>,
  ) {
    const url = `https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`
    const res = await axios.get<LiveVideoStreamStatus>(url, { headers })
    const { data } = res
    return data
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
    const data = await this.getLiveVideoStreamStatus(mediaKey, headers)
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
