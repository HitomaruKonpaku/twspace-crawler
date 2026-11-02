import Bottleneck from 'bottleneck'
import path from 'path'
import { EventEmitter } from 'stream'
import winston from 'winston'
import { AudioSpaceParticipants } from '../api/interface/twitter-graphql.interface'
import { api } from '../api/twitter.api'
import { TwitterApi } from '../apis/twitter-api'
import { TWITTER_API_LIST_SIZE, TWITTER_USER_FETCH_INTERVAL } from '../constants/twitter.constant'
import { User, UserInput } from '../interfaces/user.interface'
import { twitterApiLimiter } from '../limiter'
import { logger as baseLogger } from '../logger'
import { ArrayUtil } from '../utils/array.util'
import { TwitterEntityUtil } from '../utils/twitter-entity.util'
import { UserUtil } from '../utils/user.util'
import { Util } from '../utils/util'
import { configManager } from './config-manager'

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
    if (!username) {
      return undefined
    }
    return this.users.find((v) => v.username?.toLowerCase() === username.toLowerCase())
  }

  public getDownloadDir(creatorId: string, username: string): string {
    const user = (creatorId && this.getUserById(creatorId)) || this.getUserByUsername(username)
    const dir = user?.dir || configManager.config.downloadDir
    if (!dir || !username) {
      return undefined
    }
    return path.join(path.resolve(dir), username)
  }

  public getUsersWithId() {
    return this.users.filter((v) => v.id)
  }

  public getUsersWithoutId() {
    return this.users.filter((v) => !v.id)
  }

  public updateUserIds(participants: AudioSpaceParticipants) {
    const users = [
      ...(participants?.admins || []),
      ...(participants?.speakers || []),
      ...(participants?.listeners || []),
    ]
      .map((v) => TwitterEntityUtil.buildUserByParticipant(v))
      .filter((v) => v)
    users.forEach((user) => {
      const tmpUser = this.getUserByUsername(user.username)
      if (!tmpUser || tmpUser.id) {
        return
      }
      tmpUser.id = user.id
    })
    this.users = UserUtil.dedupe(this.users)
  }

  public async add(inputs: UserInput[]) {
    this.logger.debug('add', { inputs })
    this.users = UserUtil.dedupe([...this.users, ...UserUtil.normalize(inputs)])
    await this.fetchUsers()
  }

  private updateUser(user: User) {
    if (!user) {
      return
    }
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

    this.users = UserUtil.dedupe(this.users)

    const users = this.getUsersWithoutId()
    if (!users.length) {
      this.logger.warn(
        'fetchUsers: OK',
        { count: this.users.length - users.length },
      )
      return
    }

    this.logger.warn(
      `fetchUsers: Found some users without id. Retry in ${TWITTER_USER_FETCH_INTERVAL}ms`,
      { count: users.length, usernames: users.map((v) => v.username) },
    )
    setTimeout(() => this.fetchUsers(), TWITTER_USER_FETCH_INTERVAL)
  }

  private async fetchUsersByLookup() {
    this.logger.debug('--> fetchUsersByLookup')
    const chunks = Util.splitArrayIntoChunk(
      this.getUsersWithoutId().map((v) => v.username),
      TWITTER_API_LIST_SIZE,
    )
    const responses = await Promise.allSettled(
      chunks.map((usernames, i) => twitterApiLimiter.schedule(async () => {
        try {
          this.logger.debug(`--> getUsersByUsernames ${i + 1}`, { usernames })
          const { data: users } = await TwitterApi.getUsersByUsernames(
            usernames,
            { authorization: Util.getTwitterAuthorization() },
          )
          this.logger.debug(`<-- getUsersByUsernames ${i + 1}`)
          return Promise.resolve(users)
        } catch (error) {
          this.logger.error(`getUsersByUsernames: ${error.message}`, { usernames, response: { data: error.response?.data } })
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

    const chunkLimiter = new Bottleneck({ maxConcurrent: 1 })
    const userLimiter = new Bottleneck({ maxConcurrent: 5 })
    const users = this.getUsersWithoutId()
    const size = 50
    const chunks = ArrayUtil.splitIntoChunk(users, size)

    await Promise.allSettled(chunks.map((chunk, chunkIndex) => chunkLimiter.schedule(async () => {
      await api.data.getGuestToken(true)
      await Promise.allSettled(chunk.map((curUser, userIndex) => userLimiter.schedule(async () => {
        const { username } = curUser
        this.logger.debug(`--> getUserByScreenName ${chunkIndex * size + userIndex + 1}`, { username })
        const user = await this.getUserByScreenName(username)
        this.logger.debug(`<-- getUserByScreenName ${chunkIndex * size + userIndex + 1}`, { username })
        this.updateUser(user)
        this.emitListReady()
        return user
      })))
    })))

    this.logger.debug('<-- fetchUsersByScreenName')
  }

  private async getUserByScreenName(username: string): Promise<User> {
    try {
      let result = await this.fetchUserResult(username)
      const unavailable = result?.__typename === 'UserUnavailable'

      if (unavailable) {
        this.logger.debug('getUserByScreenName#retryWithAuth', { username, reason: result.reason, msg: result.message })
        result = await this.fetchUserResult(username, true)
      }

      if (!result?.legacy) {
        if (unavailable) {
          this.removeUser(username)
        }
        return null
      }

      const user = {
        id: result.rest_id,
        username: result.legacy.screen_name,
      }
      return user
    } catch (error) {
      this.logger.error(`getUserByScreenName: ${error.message}`, { username })
    }

    return null
  }

  private async fetchUserResult(username: string, useAuth = false) {
    const { data } = await api.graphql.UserByScreenName(username, useAuth)
    this.logger.debug('getUserByScreenName#data', { username, useAuth, data })
    return data?.data?.user?.result
  }

  private removeUser(username: string) {
    this.logger.warn(`removeUser: ${username}`)
    this.users = this.users.filter((v) => v.username.toLowerCase() !== username.toLowerCase())
  }

  private emitListReady() {
    const users = this.getUsersWithId()
    if (users.length === 100) {
      this.emit('list_ready')
    }
  }
}

export const userManager = new UserManager()
