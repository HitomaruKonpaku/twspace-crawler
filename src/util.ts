import axios from 'axios'
import moment from 'moment'
import { config } from './config'

export class Util {
  public static getTimeString(format = 'YYMMDDHHmmSS'): string {
    const s = moment().format(format)
    return s
  }

  public static async getTwitterGuestToken(): Promise<string> {
    const res = await axios.get<string>(config.twitter.baseUrl)
    const { data } = res
    const token = /(?<=gt=)\d{19}/.exec(data)[0]
    return token
  }

  public static async getTwitterSpaceMetadata(
    spaceId: string,
    headers?: Record<string, string>,
  ): Promise<Record<string, any>> {
    const url = new URL(config.twitter.api.AudioSpaceById, config.twitter.baseApiUrl)
    const vars = {
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
    }
    url.searchParams.append('variables', JSON.stringify(vars))
    const { href } = url
    const res = await axios.get<any>(href, { headers })
    const { metadata } = res.data.data.audioSpace
    return metadata
  }

  public static getStreamMasterUrlFromDynamicUrl(dynamicUrl: string): string {
    const masterUrl = dynamicUrl
      .replace('?type=live', '')
      .replace('dynamic', 'master')
    return masterUrl
  }

  public static async getStreamDynamicUrl(
    mediaKey: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    const url = `https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`
    const res = await axios.get<any>(url, { headers })
    const { data } = res
    const dynamicUrl: string = data.source.location
    return dynamicUrl
  }

  public static async getStreamMasterUrl(
    mediaKey: string,
    headers?: Record<string, string>,
  ): Promise<string> {
    const dynamicUrl = await this.getStreamDynamicUrl(mediaKey, headers)
    const masterUrl = this.getStreamMasterUrlFromDynamicUrl(dynamicUrl)
    return masterUrl
  }
}
