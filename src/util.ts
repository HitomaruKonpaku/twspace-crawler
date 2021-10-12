import axios from 'axios'
import moment from 'moment'

export class Util {
  public static getTimeString(format = 'YYMMDDHHmmSS'): string {
    const s = moment().format(format)
    return s
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
    const dynamicUrl = await this.getDynamicUrl(mediaKey, headers)
    const masterUrl = this.getMasterUrlFromDynamicUrl(dynamicUrl)
    return masterUrl
  }
}
