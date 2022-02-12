import { randomUUID } from 'crypto'
import { EventEmitter } from 'stream'
import winston from 'winston'
import { TwitterApi } from '../apis/TwitterApi'
import { TWITTER_API_LIST_SIZE, TWITTER_AUTHORIZATION, TWITTER_USER_FETCH_INTERVAL } from '../constants/twitter.constant'
import { twitterApiLimiter } from '../Limiter'
import { logger as baseLogger } from '../logger'
import { Util } from '../utils/Util'
import { configManager } from './ConfigManager'

interface User {
  id: string
  username: string
}

class UserManager extends EventEmitter {
  private logger: winston.Logger
  private users: User[] = []

  constructor() {
    super()
    this.logger = baseLogger.child({ label: '[UserManager]' })
  }

  public getUsers() {
    return this.users
  }

  public getUserById(id: string) {
    return this.users.find((v) => v.id === id)
  }

  public getUserByUsername(username: string) {
    return this.users.find((v) => v.username.toLowerCase() === username.toLowerCase())
  }

  public getUsersWithId() {
    return this.users.filter((v) => v.id)
  }

  public getUsersWithoutId() {
    return this.users.filter((v) => !v.id)
  }

  public async add(usernames: string[]) {
    this.logger.debug('add', { usernames })
    usernames.forEach((username) => {
      if (this.getUserByUsername(username)) {
        return
      }
      this.users.push({ id: null, username })
    })
    await this.fetchUsers()
  }

  private updateUser(user: User) {
    const tmpUser = this.getUserByUsername(user.username)
    if (!tmpUser) {
      return
    }
    Object.assign(tmpUser, user)
  }

  private async fetchUsers() {
    try {
      if (Util.getTwitterAuthorization()) {
        await this.fetchUsersByLookup()
      } else {
        await this.fetchUsersByScreenName()
      }
    } catch (error) {
      this.logger.error(`fetchUsers: ${error.message}`)
    }
    const users = this.getUsersWithoutId()
    if (users.length) {
      this.logger.warn(`fetchUsers: Found some users without id. Retry in ${TWITTER_USER_FETCH_INTERVAL}ms`, { usernames: users.map((v) => v.username) })
      setTimeout(() => this.fetchUsers(), TWITTER_USER_FETCH_INTERVAL)
    }
  }

  private async fetchUsersByLookup() {
    this.logger.debug('--> fetchUsersByLookup')
    const chunks = Util.splitArrayIntoChunk(
      this.getUsersWithoutId().map((v) => v.username),
      TWITTER_API_LIST_SIZE,
    )
    const responses = await Promise.allSettled(
      chunks.map((usernames, i) => twitterApiLimiter.schedule(async () => {
        const requestId = randomUUID()
        try {
          this.logger.debug(`--> getUsersByUsernames ${i + 1}`, { requestId, usernames })
          const { data: users } = await TwitterApi.getUsersByUsernames(
            usernames,
            { authorization: Util.getTwitterAuthorization() },
          )
          this.logger.debug(`<-- getUsersByUsernames ${i + 1}`, { requestId })
          return Promise.resolve(users)
        } catch (error) {
          this.logger.error(`getUsersByUsernames: ${error.message}`, { requestId, response: { data: error.response?.data } })
          throw error
        }
      })),
    )
    responses.forEach((response) => {
      if (response.status !== 'fulfilled' || !response.value) {
        return
      }
      response.value.forEach((v) => {
        this.updateUser({
          id: v.id,
          username: v.username,
        })
      })
    })
    this.logger.debug('<-- fetchUsersByLookup')
  }

  private async fetchUsersByScreenName() {
    this.logger.debug('--> fetchUsersByScreenName')
    await configManager.getGuestToken()
    const responses = await Promise.allSettled(
      this.getUsersWithoutId().map((v, i) => twitterApiLimiter.schedule(async () => {
        const { username } = v
        this.logger.debug(`--> getUserByScreenName ${i + 1}`, { username })
        try {
          const user = await TwitterApi.getUserByScreenName(username, {
            authorization: TWITTER_AUTHORIZATION,
            'x-guest-token': configManager.guestToken,
          })
          this.logger.debug(`<-- getUserByScreenName ${i + 1}`, { username })
          return Promise.resolve(user)
        } catch (error) {
          this.logger.error(`fetchUsersByScreenName: ${error.message}`, { username })
          throw error
        }
      })),
    )
    responses.forEach((response) => {
      if (response.status !== 'fulfilled') {
        return
      }
      const { result } = response.value.data.user
      this.updateUser({
        id: result.rest_id,
        username: result.legacy.screen_name,
      })
    })
    this.logger.debug('<-- fetchUsersByScreenName')
  }
}

export const userManager = new UserManager()
