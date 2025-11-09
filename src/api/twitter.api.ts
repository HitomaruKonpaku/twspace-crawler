import { TwitterFleetApi } from './api/twitter-fleet.api'
import { TwitterGraphqlApi } from './api/twitter-graphql.api'
import { TwitterGuestApi } from './api/twitter-guest.api'
import { TwitterLiveVideoStreamApi } from './api/twitter-live-video-stream.api'
import { TwitterTransaction } from './twitter-transaction'
import { TwitterApiData } from './twitter.api.data'

export class TwitterApi {
  public readonly transaction = new TwitterTransaction()

  public readonly data: TwitterApiData = new TwitterApiData(this)

  public readonly graphql = new TwitterGraphqlApi(this, 'graphql')
  public readonly fleet = new TwitterFleetApi(this, 'fleets/v1')
  public readonly guest = new TwitterGuestApi(this, '1.1/guest')
  public readonly liveVideoStream = new TwitterLiveVideoStreamApi(this, '1.1/live_video_stream')
}

export const api = new TwitterApi()
