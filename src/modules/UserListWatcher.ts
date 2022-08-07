import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import winston from 'winston'
import { TwitterApi } from '../apis/TwitterApi'
import { TWITTER_API_LIST_SIZE, TWITTER_AUTHORIZATION } from '../constants/twitter.constant'
import { SpaceState } from '../enums/Twitter.enum'
import { twitterSpaceApiLimiter } from '../Limiter'
import { logger as baseLogger } from '../logger'
import { Util } from '../utils/Util'
import { User, userManager } from './UserManager'

export class UserListWatcher extends EventEmitter {
  private logger: winston.Logger

  constructor() {
    super()
    this.logger = baseLogger.child({ label: '[UserListWatcher]' })
  }

  public watch() {
    this.logger.info('Watching...')
    this.getUserSpaces()
  }

  private async getUserSpaces() {
    const users = userManager.getUsersWithId()
    if (users.length) {
      const userChunks = Util.splitArrayIntoChunk(users, TWITTER_API_LIST_SIZE)
      // eslint-disable-next-line max-len
      await Promise.allSettled(userChunks.map((userChunk) => twitterSpaceApiLimiter.schedule(() => this.getSpaces(userChunk))))
    }
    setTimeout(() => this.getUserSpaces(), Util.getUserRefreshInterval())
  }

  private async getSpaces(users: User[]) {
    const requestId = randomUUID()
    const usernames = users.map((v) => v.username)
    const userIds = users.map((v) => v.id)
    this.logger.debug('--> getSpaces', { requestId, usernames })
    try {
      const liveSpaceIds: string[] = []
      if (Util.getTwitterAuthorization()) {
        const { data: spaces } = await TwitterApi.getSpacesByCreatorIds(
          userIds,
          { authorization: Util.getTwitterAuthorization() },
        )
        this.logger.debug('<-- getSpaces', { requestId })
        liveSpaceIds.push(
          ...(spaces || [])
            .filter((v) => v.state === SpaceState.LIVE)
            .map((v) => v.id),
        )
      } else if (Util.getTwitterAuthToken()) {
        const data = await TwitterApi.getSpacesByFleetsAvatarContent(
          userIds,
          {
            authorization: TWITTER_AUTHORIZATION,
            cookie: [`auth_token=${Util.getTwitterAuthToken()}`].join(';'),
          },
        )
        this.logger.debug('<-- getSpaces', { requestId })
        liveSpaceIds.push(
          ...Object.values(data.users)
            .map((v: any) => v.spaces?.live_content?.audiospace?.broadcast_id)
            .filter((v) => v),
        )
      }
      if (liveSpaceIds.length) {
        this.logger.debug(`Live space ids: ${liveSpaceIds.join(',')}`)
        liveSpaceIds.forEach((id) => this.emit('data', id))
      }
    } catch (error) {
      this.logger.error(`getSpaces: ${error.message}`, {
        requestId,
        response: {
          data: error.response?.data,
          headers: error.response?.headers,
        },
      })
    }
  }
}
