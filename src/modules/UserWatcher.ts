import EventEmitter from 'events'
import winston from 'winston'
import { TwitterApi } from '../apis/TwitterApi'
import { configManager } from '../ConfigManager'
import { TWITTER_AUTHORIZATION, TWITTER_GUEST_TOKEN_RETRY_MS } from '../constants/twitter.constant'
import { SpaceMetadataState } from '../enums/Twitter.enum'
import { logger as baseLogger } from '../logger'
import { Util } from '../utils/Util'

export class UserWatcher extends EventEmitter {
  private logger: winston.Logger

  private userId: string
  private cacheSpaceIds = new Set<string>()

  constructor(public username: string) {
    super()
    this.logger = baseLogger.child({ label: `[UserWatcher@${username}]` })
  }

  // eslint-disable-next-line class-methods-use-this
  private get headers() {
    return {
      authorization: TWITTER_AUTHORIZATION,
      'x-guest-token': configManager.guestToken,
    }
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    this.getSpaces()
  }

  private async getSpaces(): Promise<void> {
    this.logger.debug('>>> getSpaces')
    try {
      await configManager.getGuestToken()
    } catch (error) {
      this.logger.error(`getSpaces: ${error.message}`)
      this.logger.info(`Retry in ${TWITTER_GUEST_TOKEN_RETRY_MS}ms`)
      setTimeout(() => this.getSpaces(), TWITTER_GUEST_TOKEN_RETRY_MS)
      return
    }

    try {
      await this.getUserId()
      await this.getUserTweets()
    } catch (error) {
      this.logger.error(`getSpaces: ${error.message}`)
    }
    setTimeout(() => this.getSpaces(), Util.getUserRefreshInterval())
  }

  private async getUserId() {
    if (this.userId) {
      return
    }
    this.logger.debug('>>> getUserId')
    const data = await TwitterApi.getUserByScreenName(this.username, this.headers)
    this.userId = data.data.user.result.rest_id
  }

  private async getUserTweets() {
    this.logger.debug('>>> getUserTweets')
    const data = await TwitterApi.getUserTweets(this.userId, this.headers)
    const { instructions } = data.data.user.result.timeline.timeline
    const instruction = instructions.find((v) => v.type === 'TimelineAddEntries')
    const tweets: any[] = instruction.entries
      .filter((v) => v.content.entryType === 'TimelineTimelineItem')
      .map((v) => v.content.itemContent.tweet_results.result)
      .filter((v) => v.card)
    const ids: string[] = tweets
      .map((tweet) => tweet.card.legacy.binding_values.find((v) => v.key === 'id')?.value?.string_value)
      .filter((v) => v)
    ids.forEach((id) => this.getAudioSpaceById(id))
    this.cleanCacheSpaceIds(ids)
    this.logger.debug('<<< getUserTweets', { spaceIds: ids })
  }

  private async getAudioSpaceById(id: string) {
    if (this.cacheSpaceIds.has(id)) {
      return
    }
    try {
      this.logger.debug('>>> getAudioSpaceById', { id })
      const data = await TwitterApi.getAudioSpaceById(id, this.headers)
      const { state } = data.data.audioSpace.metadata
      this.logger.debug('<<< getAudioSpaceById', { id, state })
      this.cacheSpaceIds.add(id)
      if (state !== SpaceMetadataState.RUNNING) {
        return
      }
      this.emit('data', id)
    } catch (error) {
      this.logger.error(`getAudioSpaceById: ${error.message}`, { id })
    }
  }

  private cleanCacheSpaceIds(keepIds: string[]) {
    Array.from(this.cacheSpaceIds).forEach((id) => {
      if (keepIds.includes(id)) {
        return
      }
      this.cacheSpaceIds.delete(id)
    })
  }
}
