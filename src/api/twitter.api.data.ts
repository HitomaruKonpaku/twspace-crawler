import Bottleneck from 'bottleneck'
import { TwitterRateLimit } from './interface/twitter-api.interface'
import { TwitterApi } from './twitter.api'
import { TWITTER_GUEST_TOKEN_DURATION, TWITTER_PUBLIC_AUTHORIZATION, TWITTER_PUBLIC_AUTHORIZATION_2 } from './twitter.constant'

export class TwitterApiData {
  public readonly rateLimits: Record<string, TwitterRateLimit> = {}

  private guestToken: string
  private guestTokenCreatedAt: number

  private guestToken2: string
  private guestTokenCreatedAt2: number

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
        const { data } = await this.api.guest.activate(TWITTER_PUBLIC_AUTHORIZATION)
        this.guestToken = data.guest_token
        this.guestTokenCreatedAt = Date.now()
      }
      return this.guestToken
    })
    return token
  }

  public async getGuestToken2(forceRefresh = false): Promise<string> {
    const token = await this.guestTokenLimiter.schedule(async () => {
      const tokenAliveDuration = Date.now() - (this.guestTokenCreatedAt2 || 0)
      const canRefresh = forceRefresh
        || !this.guestToken2
        || tokenAliveDuration >= TWITTER_GUEST_TOKEN_DURATION
      if (canRefresh) {
        const { data } = await this.api.guest.activate(TWITTER_PUBLIC_AUTHORIZATION_2)
        this.guestToken2 = data.guest_token
        this.guestTokenCreatedAt2 = Date.now()
      }
      return this.guestToken2
    })
    return token
  }
}
