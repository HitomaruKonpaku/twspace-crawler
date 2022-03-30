/* eslint-disable max-len */
import axios from 'axios'
import { TWITTER_AUTHORIZATION } from '../constants/twitter.constant'
import { AudioSpaceMetadata, LiveVideoStreamStatus, User as User1 } from '../interfaces/Twitter.interface'
import { BaseResponse, Space, User } from '../interfaces/Twitter2.interface'

export class TwitterApi {
  public static async getGuestToken(): Promise<string> {
    const { data } = await axios.request({
      method: 'POST',
      url: 'https://api.twitter.com/1.1/guest/activate.json',
      headers: { authorization: TWITTER_AUTHORIZATION },
    })
    return data.guest_token
  }

  public static async getUsersLookup(usernames: string[], headers: Record<string, string>) {
    const { data } = await axios.get<User1[]>('https://api.twitter.com/1.1/users/lookup.json', {
      headers,
      params: { screen_name: usernames.join(',') },
    })
    return data
  }

  /**
   * @see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by
   */
  public static async getUsersByUsernames(usernames: string[], headers: Record<string, string>) {
    const { data } = await axios.get<BaseResponse<User[]>>('https://api.twitter.com/2/users/by', {
      headers,
      params: { usernames: usernames.join(',') },
    })
    return data
  }

  /**
   * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-by-creator-ids
   */
  public static async getSpacesByCreatorIds(userIds: string[], headers: Record<string, string>) {
    const { data } = await axios.get<BaseResponse<Space[]>>('https://api.twitter.com/2/spaces/by/creator_ids', {
      headers,
      params: { user_ids: userIds.join(',') },
    })
    return data
  }

  public static async getSpacesByFleetsAvatarContent(userIds: string[], headers: Record<string, string>) {
    const { data } = await axios.get('https://twitter.com/i/api/fleets/v1/avatar_content', {
      headers,
      params: {
        user_ids: userIds.join(','),
        only_spaces: true,
      },
    })
    return data
  }

  public static async getUserByFollowButtonInfo(username: string) {
    const { data } = await axios.get('https://cdn.syndication.twimg.com/widgets/followbutton/info.json', {
      params: { screen_names: username },
    })
    return data?.[0]
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
