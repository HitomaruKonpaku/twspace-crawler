import axios from 'axios'
import EventEmitter from 'events'
import { config } from './config'
import { Downloader } from './Downloader'
import logger from './logger'
import { Util } from './Util'

export class SpaceWatcher extends EventEmitter {
  private metadata: Record<string, any>
  private mediaKey: string
  private streamDynamicUrl: string

  constructor(public spaceId: string) {
    super()
    this.spaceId = spaceId
  }

  public async watch(): Promise<void> {
    logger.info({ spaceId: this.spaceId, msg: 'Watching space...' })
    try {
      const guestToken = await Util.getTwitterGuestToken()
      logger.debug({ spaceId: this.spaceId, guestToken })
      const headers = {
        authorization: process.env.AUTHORIZATION,
        'x-guest-token': guestToken,
      }
      this.metadata = await Util.getTwitterSpaceMetadata(this.spaceId, headers)
      logger.debug({ spaceId: this.spaceId, metadata: this.metadata })
      this.mediaKey = this.metadata.media_key
      this.streamDynamicUrl = await Util.getDynamicUrl(this.mediaKey, headers)
      logger.info({ spaceId: this.spaceId, streamUrl: this.streamDynamicUrl })
      this.checkPlaylist()
    } catch (error) {
      logger.error({ spaceId: this.spaceId, error: { msg: error.message, stack: error.stack } })
    }
  }

  private async checkPlaylist(): Promise<void> {
    logger.debug({ spaceId: this.spaceId, url: this.streamDynamicUrl })
    let status: number
    try {
      status = (await axios.head(this.streamDynamicUrl)).status
      logger.debug({ spaceId: this.spaceId, status })
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
    } catch (error) {
      status = error.response.status
      if (status === 404) {
        logger.info({ spaceId: this.spaceId, status })
        Downloader.downloadMedia(this.streamDynamicUrl, `${Util.getTimeString()}_${this.spaceId}`)
        return
      }
      logger.error({
        spaceId: this.spaceId,
        status,
        error: { msg: error.message, stack: error.stack },
      })
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
    }
  }
}
