import axios from 'axios'
import EventEmitter from 'events'
import winston from 'winston'
import { config } from './config'
import { Downloader } from './Downloader'
import { logger as baseLogger } from './logger'
import { Util } from './Util'

export class SpaceWatcher extends EventEmitter {
  private logger: winston.Logger
  private metadata: Record<string, any>
  private mediaKey: string
  private dynamicPlaylistUrl: string

  constructor(
    public spaceId: string,
    public username = null,
  ) {
    super()
    this.logger = baseLogger.child({ label: `[SpaceWatcher@${spaceId}]` })
    this.spaceId = spaceId
    this.username = username
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    try {
      const guestToken = await Util.getTwitterGuestToken()
      this.logger.debug(`Guest token: ${guestToken}`)
      const headers = {
        authorization: config.twitter.authorization,
        'x-guest-token': guestToken,
      }
      this.metadata = await Util.getTwitterSpaceMetadata(this.spaceId, headers)
      this.logger.debug(`Metadata: ${JSON.stringify(this.metadata)}`)
      this.mediaKey = this.metadata.media_key
      this.dynamicPlaylistUrl = await Util.getDynamicUrl(this.mediaKey, headers)
      this.logger.info(`Playlist url: ${this.dynamicPlaylistUrl}`)
      this.checkPlaylist()
    } catch (error) {
      this.logger.error(error.message, { stack: error.stack })
    }
  }

  private async checkPlaylist(): Promise<void> {
    this.logger.debug(`Playlist url: ${this.dynamicPlaylistUrl}`)
    let status: number
    try {
      status = (await axios.head(this.dynamicPlaylistUrl)).status
      this.logger.debug(`Status: ${status}`)
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
    } catch (error) {
      status = error.response.status
      if (status === 404) {
        this.logger.info(`Status: ${status}`)
        Downloader.downloadMedia(this.dynamicPlaylistUrl, `${Util.getTimeString()}_${this.spaceId}`, this.username)
        return
      }
      this.logger.error(error.message, { status, stack: error.stack })
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
    }
  }
}
