import axios from 'axios'
import { program } from 'commander'
import EventEmitter from 'events'
import { existsSync } from 'fs'
import nodeNotifier from 'node-notifier'
import open from 'open'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { TwitterApi } from '../apis/TwitterApi'
import { APP_PLAYLIST_CHUNK_VERIFY_MAX_RETRY, APP_PLAYLIST_REFRESH_INTERVAL } from '../constants/app.constant'
import { TWITTER_AUTHORIZATION } from '../constants/twitter.constant'
import { Downloader } from '../Downloader'
import { AccessChat } from '../interfaces/Periscope.interface'
import { AudioSpaceMetadata, LiveVideoStreamStatus } from '../interfaces/Twitter.interface'
import { logger as baseLogger } from '../logger'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { Util } from '../utils/Util'
import { configManager } from './ConfigManager'
import { SpaceCaptionsDownloader } from './SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from './SpaceCaptionsExtractor'
import { SpaceDownloader } from './SpaceDownloader'

export class SpaceWatcher extends EventEmitter {
  private logger: winston.Logger
  private downloader: SpaceDownloader

  private metadata: AudioSpaceMetadata
  private liveStreamStatus: LiveVideoStreamStatus
  private accessChatData: AccessChat
  private mediaKey: string
  private dynamicPlaylistUrl: string
  private lastChunkIndex: number

  private chunkVerifyCount = 0
  private isNotificationNotified = false

  constructor(
    public spaceId: string,
    public username = null,
  ) {
    super()
    this.logger = baseLogger.child({ label: `[SpaceWatcher@${spaceId}]` })
    // open(this.spaceUrl)
  }

  public get spaceUrl(): string {
    return `https://twitter.com/i/spaces/${this.spaceId}`
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    this.logger.info(`Space url: ${this.spaceUrl}`)
    try {
      const guestToken = await configManager.getGuestToken()
      const headers = {
        authorization: TWITTER_AUTHORIZATION,
        'x-guest-token': guestToken,
      }
      this.metadata = await TwitterApi.getSpaceMetadata(this.spaceId, headers)
      this.logger.info('Host info', {
        screenName: this.metadata.creator_results?.result?.legacy?.screen_name,
        displayName: this.metadata.creator_results?.result?.legacy?.name,
      })
      this.logger.info(`Space metadata: ${JSON.stringify(this.metadata)}`)
      this.showNotification()
      this.mediaKey = this.metadata.media_key
      this.liveStreamStatus = await TwitterApi.getLiveVideoStreamStatus(this.mediaKey, headers)
      this.logger.debug('liveStreamStatus', this.liveStreamStatus)
      this.accessChatData = await PeriscopeApi.getAccessChat(this.liveStreamStatus.chatToken)
      this.logger.debug('accessChat data', this.accessChatData)
      this.logger.info(`Chat endpoint: ${this.accessChatData.endpoint}`)
      this.logger.info(`Chat access token: ${this.accessChatData.access_token}`)
      this.dynamicPlaylistUrl = this.liveStreamStatus.source.location
      this.logger.info(`Playlist url: ${this.dynamicPlaylistUrl}`)
      if (program.getOptionValue('force')) {
        this.downloadMedia()
        return
      }
      this.checkDynamicPlaylist()
    } catch (error) {
      this.logger.error(`watch: ${error.message}`)
      const timeoutMs = 5000
      this.logger.info(`Retry watch in ${timeoutMs}ms`)
      setTimeout(() => this.watch(), timeoutMs)
    }
  }

  private getUsername(): string {
    const username = this.username || this.metadata.creator_results?.result?.legacy?.screen_name
    return username
  }

  private getFilename(): string {
    const date = new Date(this.metadata.started_at || this.metadata.created_at)
      .toISOString()
      .replace(/[^\d]/g, '')
      .substring(2, 12)
    // const name = `[${date}] ${this.getUsername()} (${this.spaceId})`
    const name = `[${this.getUsername()}][${date}] ${this.metadata.title || 'NA'} (${this.spaceId})`
    return name
  }

  private async checkDynamicPlaylist(): Promise<void> {
    this.logger.debug('--> checkDynamicPlaylist', { url: this.dynamicPlaylistUrl })
    try {
      const { data } = await axios.get<string>(this.dynamicPlaylistUrl)
      this.logger.debug('<-- checkDynamicPlaylist')
      const chunkIndexes = PeriscopeUtil.getChunks(data)
      if (chunkIndexes.length) {
        this.logger.debug(`Found chunks: ${chunkIndexes.join(',')}`)
        this.lastChunkIndex = Math.max(...chunkIndexes)
      }
    } catch (error) {
      const status = error.response?.status
      if (status === 404) {
        this.logger.info(`Dynamic playlist status: ${status}`)
        this.checkMasterPlaylist()
        return
      }
      this.logger.error(`checkDynamicPlaylist: ${error.message}`)
    }
    const ms = APP_PLAYLIST_REFRESH_INTERVAL
    this.logger.debug(`Recheck dynamic playlist in ${ms}ms`)
    setTimeout(() => this.checkDynamicPlaylist(), ms)
  }

  private async checkMasterPlaylist(): Promise<void> {
    this.logger.debug('--> checkMasterPlaylist')
    try {
      // eslint-disable-next-line max-len
      const masterChunkSize = PeriscopeUtil.getChunks(await PeriscopeApi.getFinalPlaylist(this.dynamicPlaylistUrl)).length
      this.logger.debug(`<-- checkMasterPlaylist: master chunk size ${masterChunkSize}, last chunk index ${this.lastChunkIndex}`)
      const canDownload = !this.lastChunkIndex
        || this.chunkVerifyCount > APP_PLAYLIST_CHUNK_VERIFY_MAX_RETRY
        || masterChunkSize >= this.lastChunkIndex
      if (canDownload) {
        this.downloadMedia()
        this.downloadCaptions()
        return
      }
      this.logger.warn(`Master chunk size (${masterChunkSize}) lower than last chunk index (${this.lastChunkIndex})`)
      this.chunkVerifyCount += 1
    } catch (error) {
      this.logger.error(`checkMasterPlaylist: ${error.message}`)
    }
    const ms = APP_PLAYLIST_REFRESH_INTERVAL
    this.logger.info(`Recheck master playlist in ${ms}ms`)
    setTimeout(() => this.checkMasterPlaylist(), ms)
  }

  private async downloadMedia() {
    try {
      const username = this.getUsername()
      const filename = this.getFilename()
      const metadata = {
        title: this.metadata.title,
        author: this.metadata.creator_results?.result?.legacy?.name,
        artist: this.metadata.creator_results?.result?.legacy?.name,
        episode_id: this.spaceId,
      }
      this.logger.info(`File name: ${filename}`)
      this.logger.info(`File metadata: ${JSON.stringify(metadata)}`)
      if (!this.downloader) {
        this.downloader = new SpaceDownloader(this.dynamicPlaylistUrl, filename, username, metadata)
      }
      await this.downloader.download()
      this.emit('complete')
    } catch (error) {
      // Attemp to download transcode playlist right after space end could return 404
      this.logger.error(`downloadMedia: ${error.message}`)
      this.retryDownload(10000)
    }
  }

  private retryDownload(timeoutMs: number) {
    this.logger.info(`Retry download in ${timeoutMs}ms`)
    setTimeout(() => this.downloadMedia(), timeoutMs)
  }

  private async downloadCaptions() {
    try {
      const username = this.getUsername()
      const filename = this.getFilename()
      const tmpFile = path.join(Util.getMediaDir(username), `${filename} CC.jsonl`)
      const outFile = path.join(Util.getMediaDir(username), `${filename} CC.txt`)
      Util.createMediaDir(this.username)
      // eslint-disable-next-line max-len
      await new SpaceCaptionsDownloader(this.spaceId, this.accessChatData.endpoint, this.accessChatData.access_token, tmpFile).download()
      await new SpaceCaptionsExtractor(tmpFile, outFile).extract()
    } catch (error) {
      this.logger.error(`downloadCaptions: ${error.message}`)
    }
  }

  private async showNotification() {
    if (!program.getOptionValue('notification') || this.isNotificationNotified) {
      return
    }
    try {
      const user = this.metadata.creator_results?.result
      const notification: nodeNotifier.Notification = {
        title: `${user.legacy?.name || ''} Space Live`.trim(),
        message: `${this.metadata.title || ''}`,
      }
      const profileImgUrl: string = user.legacy?.profile_image_url_https?.replace('_normal', '')
      if (profileImgUrl) {
        // Since notifier can not use url, need to download it
        try {
          const imgPathname = profileImgUrl.replace('https://pbs.twimg.com/', '')
          Util.createCacheDir(path.dirname(imgPathname))
          const imgPath = path.join(Util.getCacheDir(), imgPathname)
          if (!existsSync(imgPath)) {
            await Downloader.downloadImage(profileImgUrl, imgPath)
          }
          notification.icon = imgPath
        } catch (error) {
          this.logger.error(`showNotification: ${error.message}`)
        }
      }
      this.logger.debug('Notification:', notification)
      nodeNotifier.notify(notification, (error, response) => {
        this.logger.debug('Notification callback', { response, error })
        // Tested on win32/macOS, response can be undefined, activate, timeout
        if (!error && (!response || response === 'activate')) {
          open(this.spaceUrl)
        }
      })
      this.isNotificationNotified = true
    } catch (error) {
      this.logger.error(`showNotification: ${error.message}`)
    }
  }
}
