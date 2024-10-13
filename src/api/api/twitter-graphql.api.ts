/* eslint-disable camelcase */

import { TwitterBaseApi } from '../base/twitter-base.api'
import { twitterGraphqlEndpoints } from '../constant/twitter-graphql-endpoint.constant'
import { twitterGraphqlParams } from '../constant/twitter-graphql-param.constant'
import { TwitterGraphqlEndpoint } from '../interface/twitter-api.interface'

export class TwitterGraphqlApi extends TwitterBaseApi {
  // #region User

  public async UserByRestId(userId: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserByRestId)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserByRestId,
      { variables: { userId } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserByScreenName(username: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserByScreenName)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserByScreenName,
      { variables: { screen_name: username } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserTweets(userId: string, count = 20) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserTweets)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserTweets,
      { variables: { userId, count } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserTweetsAndReplies(userId: string, count = 20) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserTweetsAndReplies)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserTweetsAndReplies,
      { variables: { userId, count } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserMedia(userId: string, count = 20) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserMedia)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserMedia,
      { variables: { userId, count } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserWithProfileTweetsQueryV2(userId: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserWithProfileTweetsQueryV2)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserWithProfileTweetsQueryV2,
      { variables: { rest_id: userId } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async UserWithProfileTweetsAndRepliesQueryV2(userId: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.UserWithProfileTweetsAndRepliesQueryV2)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.UserWithProfileTweetsAndRepliesQueryV2,
      { variables: { rest_id: userId } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  // #endregion

  // #region Tweet

  public async TweetDetail(tweetId: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.TweetDetail)
    const headers = await this.getGuestV2Headers()
    const params = this.cloneParams(
      twitterGraphqlParams.TweetDetail,
      { variables: { focalTweetId: tweetId } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  // #endregion

  // #region Home

  public async HomeLatestTimeline(count = 20) {
    const url = this.toUrl(twitterGraphqlEndpoints.HomeLatestTimeline)
    const headers = this.getAuthHeaders()
    const params = this.cloneParams(
      twitterGraphqlParams.HomeLatestTimeline,
      { variables: { count } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  // #endregion

  // #region AudioSpace

  public async AudioSpaceById(id: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.AudioSpaceById)
    const headers = this.getAuthHeaders()
    const params = this.cloneParams(
      twitterGraphqlParams.AudioSpaceById,
      { variables: { id } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async AudioSpaceById_Legacy(id: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.AudioSpaceById_Legacy)
    const headers = this.getAuthHeaders()
    const params = this.cloneParams(
      twitterGraphqlParams.AudioSpaceById_Legacy,
      { variables: { id } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  public async AudioSpaceByRestId(id: string) {
    const url = this.toUrl(twitterGraphqlEndpoints.AudioSpaceByRestId)
    const headers = this.getAuthHeaders()
    const params = this.cloneParams(
      twitterGraphqlParams.AudioSpaceByRestId,
      { variables: { audio_space_id: id } },
    )
    const res = await this.client.get(url, { headers, params })
    return res
  }

  // #endregion

  // #region Helper

  // eslint-disable-next-line class-methods-use-this
  private toUrl(endpoint: TwitterGraphqlEndpoint) {
    const url = [endpoint.queryId, endpoint.operationName].join('/')
    return url
  }

  // eslint-disable-next-line class-methods-use-this
  private cloneParams<T>(src: T, value?: any) {
    const obj = JSON.parse(JSON.stringify(src)) as T
    if (value) {
      Object.keys(value).forEach((key) => {
        Object.assign(obj, { [key]: { ...obj[key], ...value[key] } })
      })
    }
    return obj
  }

  // #endregion
}
