import axios from 'axios'
import EventEmitter from 'events'
import winston from 'winston'
import { args } from './args'
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
      this.logger.info(`Space metadata: ${JSON.stringify(this.metadata)}`)
      this.mediaKey = this.metadata.media_key
      this.dynamicPlaylistUrl = await Util.getDynamicUrl(this.mediaKey, headers)
      this.logger.info(`Playlist url: ${this.dynamicPlaylistUrl}`)
      this.checkPlaylist()
    } catch (error) {
      this.logger.error(error.message, { stack: error.stack })
      const timeoutMs = 5000
      this.logger.info(`Retry watch in ${timeoutMs}ms`)
      setTimeout(() => this.watch(), timeoutMs)
    }
  }

  private async checkPlaylist(): Promise<void> {
    this.logger.debug(`Playlist url: ${this.dynamicPlaylistUrl}`)
    let status: number
    try {
      status = (await axios.head(this.dynamicPlaylistUrl)).status
      this.logger.debug(`Status: ${status}`)
      if (args.force) {
        this.downloadMedia()
        return
      }
      setTimeout(() => this.checkPlaylist(), APP_PLAYLIST_REFRESH_INTERVAL)
    } catch (error) {
      status = error.response?.status
      if (status === 404) {
        this.logger.info(`Status: ${status}`)
        this.downloadMedia()
        return
      }
      this.logger.error(error.message, { status, stack: error.stack })
      setTimeout(() => this.checkPlaylist(), APP_PLAYLIST_REFRESH_INTERVAL)
    }
  }

  private async downloadMedia() {
    try {
      const username = this.username || this.metadata.creator_results?.result?.legacy?.screen_name
      const fileName = `[${new Date(this.metadata.created_at).toISOString().slice(0, 10).replace(/-/g, '')}] ${username} (${this.spaceId})`
      const metadata = {
        title: this.metadata.title,
        author: this.metadata.creator_results?.result?.legacy?.name,
        artist: this.metadata.creator_results?.result?.legacy?.name,
        episode_id: this.spaceId,
      }
      this.logger.info(`File name: ${fileName}`)
      this.logger.info(`File metadata: ${JSON.stringify(metadata)}`)
      await Downloader.downloadMedia(this.dynamicPlaylistUrl, fileName, username, metadata)
    } catch (error) {
      // Attemp to download transcode playlist right after space end could return 404
      this.logger.error(error.message, error)
      const timeoutMs = 10000
      this.logger.info(`Retry download in ${timeoutMs}ms`)
      setTimeout(() => this.downloadMedia(), timeoutMs)
    }
  }
}
