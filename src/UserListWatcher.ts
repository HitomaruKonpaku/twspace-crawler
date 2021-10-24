import axios from 'axios'
import EventEmitter from 'events'
import winston from 'winston'
import { TWITTER_AUTHORIZATION } from './constants/twitter.constant'
import { logger as baseLogger } from './logger'
import { Util } from './Util'

export class UserListWatcher extends EventEmitter {
  private readonly CHUNK_SIZE = 100

  private logger: winston.Logger

  private users: any[] = []
  private usernameChunks: string[][] = []

  constructor(private usernames: string[]) {
    super()
    this.logger = baseLogger.child({ label: '[UserListWatcher]' })
    this.logger.info(`Usernames: ${usernames}`)
    this.logger.info(`Username count: ${usernames.length}`)
    this.usernameChunks = [...Array(Math.ceil(usernames.length / this.CHUNK_SIZE))]
      .map(() => usernames.splice(0, this.CHUNK_SIZE))
    this.logger.info(`User chunk count: ${this.usernameChunks.length}`)
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    try {
      await this.initUsers()
      const idChunks = this.usernameChunks
        .map((chunk) => chunk
          .map((username) => this.users
            .find((user) => user.username.toLowerCase() === username.toLowerCase())?.id)
          .filter((v) => v))
      idChunks.forEach((idChunk) => this.getSpaces(idChunk))
    } catch (error) {
      this.logger.error('Failed to start watcher')
      this.logger.error(error)
      const timeoutMs = 5000
      this.logger.info(`Retry in ${timeoutMs}ms`)
      setTimeout(() => this.watch(), timeoutMs)
    }
  }

  private async initUsers() {
    const responses = await Promise.all(this.usernameChunks.map((v) => axios.get<any[]>('https://api.twitter.com/1.1/users/lookup.json', {
      headers: { authorization: TWITTER_AUTHORIZATION },
      params: { screen_name: v.join(',') },
    })))
    this.users = []
    responses.forEach((res) => {
      res.data.forEach((user) => {
        this.users.push({
          id: user.id_str,
          username: user.screen_name,
        })
      })
    })
    this.logger.debug(`User list: ${JSON.stringify(this.users)}`)
  }

  private async getSpaces(ids: string[]) {
    try {
      this.logger.silly(`User ids: ${ids.join(',')}`)
      const { data: { data: spaces } } = await axios.get<any>('https://api.twitter.com/2/spaces/by/creator_ids', {
        headers: { authorization: Util.getTwitterAuthorization() },
        params: { user_ids: ids.join(',') },
      })
      const liveSpaces = (spaces || [])
        .filter((v) => v.state === 'live')
      this.logger.debug(`Space count: ${liveSpaces.length}`)
      if (liveSpaces.length) {
        this.logger.debug(`Space ids: ${liveSpaces.map((v) => v.id).join(', ')}`)
        liveSpaces.forEach((space) => this.emit('data', space.id))
      }
    } catch (error) {
      this.logger.error(error)
    }

    setTimeout(() => this.getSpaces(ids), Util.getUserRefreshInterval())
  }
}
