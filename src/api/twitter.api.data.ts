import Bottleneck from 'bottleneck'
import { TWITTER_GUEST_TOKEN_DURATION } from '../constants/twitter.constant'
import { TwitterApi } from './twitter.api'

export class TwitterApiData {
  private guestToken: string
  private guestTokenCreatedAt: number
  private guestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })

  constructor(
    protected readonly api: TwitterApi,
  ) { }

  public async getGuestToken(forceRefresh = false): Promise<string> {
    const token = await this.guestTokenLimiter.schedule(async () => {
      const tokenAliveDuration = Date.now() - (this.guestTokenCreatedAt || 0)
      const canRefresh = forceRefresh
        || !this.guestToken
        || tokenAliveDuration >= TWITTER_GUEST_TOKEN_DURATION
      if (canRefresh) {
        const { data } = await this.api.guest.activate()
        this.guestToken = data.guest_token
        this.guestTokenCreatedAt = Date.now()
      }
      return this.guestToken
    })
    return token
  }
}
