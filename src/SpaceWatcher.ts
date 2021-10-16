import axios from 'axios'
import EventEmitter from 'events'
import winston from 'winston'
import { APP_PLAYLIST_REFRESH_INTERVAL } from './constants/app.constant'
import { TWITTER_AUTHORIZATION } from './constants/twitter.constant'
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
        authorization: TWITTER_AUTHORIZATION,
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
      setTimeout(() => this.checkPlaylist(), APP_PLAYLIST_REFRESH_INTERVAL)
    } catch (error) {
      status = error.response.status
      if (status === 404) {
        this.logger.info(`Status: ${status}`)
        this.downloadMedia()
        return
      }
      this.logger.error(error.message, { status, stack: error.stack })
      setTimeout(() => this.checkPlaylist(), APP_PLAYLIST_REFRESH_INTERVAL)
    }
  }

  private downloadMedia() {
    const username = this.username || this.metadata.creator_results?.result?.legacy?.screen_name
    const fileName = `[${new Date(this.metadata.created_at).toISOString().slice(0, 10).replace(/-/g, '')}] ${username} (${this.spaceId})`
    this.logger.info(`File name: ${fileName}`)
    Downloader.downloadMedia(this.dynamicPlaylistUrl, fileName, username)
  }
}
