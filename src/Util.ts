import axios from 'axios'
import fs from 'fs'
import { args } from './args'
import { APP_USER_REFRESH_INTERVAL } from './constants/app.constant'
import { logger } from './logger'

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
    if (args.config) {
      try {
        Object.assign(config, JSON.parse(fs.readFileSync(args.config, 'utf-8')))
      } catch (error) {
        logger.error(`Failed to read config: ${error.message}`)
      }
    }
    return config
  }

  public static getUserRefreshInterval(): number {
    return Number(Util.getExternalConfig().interval) || APP_USER_REFRESH_INTERVAL
  }

  public static async getTwitterSpacesByCreatorIds(
    ids: string[],
    headers?: Record<string, any>,
  ): Promise<any> {
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
  ): Promise<Record<string, any>> {
    const res = await axios.get<any>('https://twitter.com/i/api/graphql/jyQ0_DEMZHeoluCgHJ-U5Q/AudioSpaceById', {
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
    return metadata
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
    const url = `https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`
    const res = await axios.get<any>(url, { headers })
    const { data } = res
    const dynamicUrl: string = data.source.location
    return dynamicUrl
  }

  public static async getMasterUrl(
    mediaKey: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    return this.getMasterUrlFromDynamicUrl(await this.getDynamicUrl(mediaKey, headers))
  }
}
