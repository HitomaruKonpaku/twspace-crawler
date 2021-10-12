import axios from 'axios'
import EventEmitter from 'events'
import { config } from './config'
import logger from './logger'

export class UserWatcher extends EventEmitter {
  public username: string

  constructor(username: string) {
    super()
    this.username = username
  }

  public async watch(): Promise<void> {
    logger.info({ username: this.username, msg: 'Watching user...' })
    this.checkUser()
  }

  private async checkUser(): Promise<void> {
    const url = config.tweespaces.api.SpaceByUser
    const body = { username: this.username }
    try {
      const res = await axios.post<any>(url, body)
      const spaces: any[] = (res.data.spaces.data || [])
        .filter((v) => v.state === 'live')
      logger.debug({ username: this.username, spaceCount: spaces.length })
      if (spaces.length) {
        logger.debug({ username: this.username, spaceIds: spaces.map((v) => v.id) })
        spaces.forEach((space) => {
          this.emit('data', space.id)
        })
      }
    } catch (error) {
      logger.error({ username: this.username, error: { msg: error.message, stack: error.stack } })
      debugger
    }
    setTimeout(() => this.checkUser(), config.app.userRefreshInterval)
  }
}
