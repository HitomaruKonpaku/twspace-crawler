import axios from 'axios'
import EventEmitter from 'events'
import winston from 'winston'
import { logger as baseLogger } from './logger'
import { Util } from './Util'

export class UserWatcher extends EventEmitter {
  private logger: winston.Logger

  constructor(public username: string) {
    super()
    this.logger = baseLogger.child({ label: `[UserWatcher@${username}]` })
    this.username = username
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    this.getSpaces()
  }

  private async getSpaces(): Promise<void> {
    const url = 'https://tweespaces-serverless-function.vercel.app/api/space-by-user'
    const body = { username: this.username }
    try {
      const res = await axios.post<any>(url, body)
      const liveSpaces: any[] = (res.data.spaces.data || [])
        .filter((v) => v.state === 'live')
      this.logger.debug(`Space count: ${liveSpaces.length}`)
      if (liveSpaces.length) {
        this.logger.debug(`Space ids: ${liveSpaces.map((v) => v.id).join(', ')}`)
        liveSpaces.forEach((space) => this.emit('data', space.id))
      }
    } catch (error) {
      this.logger.error(error)
    }

    setTimeout(() => this.getSpaces(), Util.getUserRefreshInterval())
  }
}
