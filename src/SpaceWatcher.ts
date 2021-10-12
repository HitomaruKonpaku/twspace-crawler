import axios from 'axios'
import EventEmitter from 'events'
import { config } from './config'
import { Downloader } from './Downloader'
import logger from './logger'
import { Util } from './Util'

export class SpaceWatcher extends EventEmitter {
  public spaceId: string

  private guestToken: string

  private metadata: Record<string, any>

  private mediaKey: string

  private streamDynamicUrl: string

  constructor(spaceId: string) {
    super()
    this.spaceId = spaceId
  }

  private get headers() {
    const headers = {
      authorization: process.env.AUTHORIZATION,
      'x-guest-token': this.guestToken,
    }
    return headers
  }

  public async watch(): Promise<void> {
    logger.info({ spaceId: this.spaceId, msg: 'Watching space...' })
    try {
      this.guestToken = await Util.getTwitterGuestToken()
      logger.debug({ spaceId: this.spaceId, guestToken: this.guestToken })
      this.metadata = await Util.getTwitterSpaceMetadata(this.spaceId, this.headers)
      logger.debug({ spaceId: this.spaceId, metadata: this.metadata })
      this.mediaKey = this.metadata.media_key
      this.streamDynamicUrl = await Util.getDynamicUrl(this.mediaKey, this.headers)
      logger.info({ spaceId: this.spaceId, streamUrl: this.streamDynamicUrl })
      this.checkPlaylist()
    } catch (error) {
      logger.error({ spaceId: this.spaceId, error: { msg: error.message, stack: error.stack } })
      debugger
    }
  }

  private async checkPlaylist(): Promise<void> {
    const url = this.streamDynamicUrl
    logger.debug({ spaceId: this.spaceId, url })
    let status: number
    try {
      const res = await axios.head(url)
      status = res.status
      logger.debug({ spaceId: this.spaceId, status })
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
    } catch (error) {
      status = error.response.status
      if (status !== 404) {
        logger.error({
          spaceId: this.spaceId,
          status,
          error: { msg: error.message, stack: error.stack },
        })
        debugger
        setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistRefreshInterval)
        return
      }
      logger.info({ spaceId: this.spaceId, status })
      Downloader.downloadMedia(url, `${Util.getTimeString()}_${this.spaceId}`)
    }
  }
}
