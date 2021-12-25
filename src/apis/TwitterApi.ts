import axios from 'axios'
import { AudioSpaceMetadata, LiveVideoStreamStatus, User } from '../interfaces/Twitter.interface'

export class TwitterApi {
  public static async getGuestToken(): Promise<string> {
    const { data } = await axios.get<string>('https://twitter.com/')
    try {
      const token = /(?<=gt=)\d{19}/.exec(data)[0]
      return token
    } catch (error) {
      throw new Error('Guest token not found')
    }
  }

  public static async getUsersLookup(usernames: string[], headers: Record<string, string>) {
    const { data } = await axios.get<User[]>('https://api.twitter.com/1.1/users/lookup.json', {
      headers,
      params: { screen_name: usernames.join(',') },
    })
    return data
  }

  public static async getSpacesByCreatorIds(ids: string[], headers: Record<string, string>) {
    const { data } = await axios.get('https://api.twitter.com/2/spaces/by/creator_ids', {
      headers,
      params: { user_ids: ids.join(',') },
    })
    return data
  }

  public static async getUserByScreenName(username: string, headers: Record<string, string>) {
    const { data } = await axios.get('https://twitter.com/i/api/graphql/7mjxD3-C6BxitPMVQ6w0-Q/UserByScreenName', {
      headers,
      params: {
        variables: {
          screen_name: username,
          withSafetyModeUserFields: false,
          withSuperFollowsUserFields: false,
        },
      },
    })
    return data
  }

  public static async getUserTweets(userId: string, headers: Record<string, string>) {
    const { data } = await axios.get('https://twitter.com/i/api/graphql/QvCV3AU7X1ZXr9JSrH9EOA/UserTweets', {
      headers,
      params: {
        variables: {
          userId,
          count: 10,
          withTweetQuoteCount: false,
          includePromotedContent: false,
          withQuickPromoteEligibilityTweetFields: false,
          withSuperFollowsUserFields: false,
          withBirdwatchPivots: false,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withVoice: false,
          withV2Timeline: false,
        },
      },
    })
    return data
  }

  public static async getAudioSpaceById(spaceId: string, headers: Record<string, string>) {
    const { data } = await axios.get('https://twitter.com/i/api/graphql/Uv5R_-Chxbn1FEkyUkSW2w/AudioSpaceById', {
      headers,
      params: {
        variables: {
          id: spaceId,
          isMetatagsQuery: false,
          withSuperFollowsUserFields: false,
          withBirdwatchPivots: false,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withReplays: false,
          withScheduledSpaces: false,
        },
      },
    })
    return data
  }

  public static async getSpaceMetadata(spaceId: string, headers: Record<string, string>) {
    const data = await this.getAudioSpaceById(spaceId, headers)
    const { metadata } = data.data.audioSpace
    return metadata as AudioSpaceMetadata
  }

  public static async getLiveVideoStreamStatus(mediaKey: string, headers: Record<string, string>) {
    const url = `https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`
    const { data } = await axios.get<LiveVideoStreamStatus>(url, { headers })
    return data
  }
}
