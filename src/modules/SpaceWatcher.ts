import axios from 'axios'
import { program } from 'commander'
import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import open from 'open'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { TwitterApi } from '../apis/TwitterApi'
import { APP_PLAYLIST_CHUNK_VERIFY_MAX_RETRY, APP_PLAYLIST_REFRESH_INTERVAL, APP_SPACE_ERROR_RETRY_INTERVAL } from '../constants/app.constant'
import { TWITTER_AUTHORIZATION } from '../constants/twitter.constant'
import { SpaceMetadataState } from '../enums/Twitter.enum'
import { AccessChat } from '../interfaces/Periscope.interface'
import { AudioSpaceMetadata, LiveVideoStreamStatus } from '../interfaces/Twitter.interface'
import { logger as baseLogger } from '../logger'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { TwitterUtil } from '../utils/TwitterUtil'
import { Util } from '../utils/Util'
import { configManager } from './ConfigManager'
import { Notification } from './Notification'
import { SpaceCaptionsDownloader } from './SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from './SpaceCaptionsExtractor'
import { SpaceDownloader } from './SpaceDownloader'
import { Webhook } from './Webhook'

export class SpaceWatcher extends EventEmitter {
  private logger: winston.Logger
  private downloader: SpaceDownloader

  private metadata: AudioSpaceMetadata
  private liveStreamStatus: LiveVideoStreamStatus
  private accessChatData: AccessChat
  private dynamicPlaylistUrl: string

  private lastChunkIndex: number
  private chunkVerifyCount = 0

  private isNotificationNotified = false

  constructor(public spaceId: string) {
    super()
    this.logger = baseLogger.child({ label: `[SpaceWatcher@${spaceId}]` })

    // Force open space url in browser (no need to wait for notification)
    if (program.getOptionValue('forceOpen')) {
      open(this.spaceUrl)
    }
  }

  public get spaceUrl(): string {
    return TwitterUtil.getSpaceUrl(this.spaceId)
  }

  public get spaceTitle(): string {
    return this.metadata.title
  }

  public get userScreenName(): string {
    return this.metadata.creator_results?.result?.legacy?.screen_name
  }

  public get userDisplayName(): string {
    return this.metadata.creator_results?.result?.legacy?.name
  }

  public get userProfileImgUrl(): string {
    return this.metadata.creator_results?.result?.legacy?.profile_image_url_https?.replace?.('_normal', '')
  }

  private get filename(): string {
    const time = Util.getTimeString(this.metadata.started_at || this.metadata.created_at)
    const name = `[${this.userScreenName}][${time}] ${Util.getCleanFileName(this.spaceTitle) || 'NA'} (${this.spaceId})`
    return name
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    this.logger.info(`Space url: ${this.spaceUrl}`)
    try {
      await this.initData()
    } catch (error) {
      if (this.metadata) {
        this.logger.error(`watch: ${error.message}`)
      }
      const ms = APP_SPACE_ERROR_RETRY_INTERVAL
      this.logger.info(`Retry watch in ${ms}ms`)
      setTimeout(() => this.watch(), ms)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async getHeaders() {
    const guestToken = await configManager.getGuestToken()
    const headers = {
      authorization: TWITTER_AUTHORIZATION,
      'x-guest-token': guestToken,
    }
    return headers
  }

  private async getSpaceMetadata() {
    const headers = await this.getHeaders()
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getSpaceMetadata', { requestId })
      this.metadata = await TwitterApi.getSpaceMetadata(this.spaceId, headers)
      this.logger.debug('<-- getSpaceMetadata', { requestId })
      this.logger.info('Host info', { screenName: this.userScreenName, displayName: this.userDisplayName })
      this.logger.info(`Space metadata: ${JSON.stringify(this.metadata)}`)
    } catch (error) {
      const meta = { requestId }
      if (error.response) {
        Object.assign(meta, {
          response: {
            status: error.response.status,
            data: error.response.data,
          },
        })
      }
      this.logger.error(`getSpaceMetadata: ${error.message}`, meta)

      // Bad guest token
      if (error.response?.data?.errors?.some?.((v) => v.code === 239)) {
        configManager.getGuestToken(true)
          .then(() => this.logger.debug('getSpaceMetadata: refresh guest token success'))
          .catch(() => this.logger.error('getSpaceMetadata: refresh guest token failed'))
      }

      throw error
    }
  }

  private async initData() {
    if (!this.metadata) {
      await this.getSpaceMetadata()
      if (this.metadata.state === SpaceMetadataState.RUNNING) {
        this.showNotification()
        this.sendWebhooks()
      }
    }

    // Download space by url with available metadata
    this.dynamicPlaylistUrl = program.getOptionValue('url')
    if (this.dynamicPlaylistUrl) {
      this.downloadAudio()
      return
    }

    if (!this.liveStreamStatus) {
      const requestId = randomUUID()
      const headers = await this.getHeaders()
      this.logger.debug('--> getLiveVideoStreamStatus', { requestId })
      // eslint-disable-next-line max-len
      this.liveStreamStatus = await TwitterApi.getLiveVideoStreamStatus(this.metadata.media_key, headers)
      this.logger.debug('<-- getLiveVideoStreamStatus', { requestId })
      this.logger.debug('liveStreamStatus', this.liveStreamStatus)
    }

    this.dynamicPlaylistUrl = this.liveStreamStatus.source.location
    this.logger.info(`Master playlist url: ${PeriscopeUtil.getMasterPlaylistUrl(this.dynamicPlaylistUrl)}`)

    if (!this.accessChatData) {
      const requestId = randomUUID()
      this.logger.debug('--> getAccessChat', { requestId })
      this.accessChatData = await PeriscopeApi.getAccessChat(this.liveStreamStatus.chatToken)
      this.logger.debug('<-- getAccessChat', { requestId })
      this.logger.debug('accessChat data', this.accessChatData)
      this.logger.info(`Chat endpoint: ${this.accessChatData.endpoint}`)
      this.logger.info(`Chat access token: ${this.accessChatData.access_token}`)
    }

    // Force download space
    if (program.getOptionValue('force')) {
      this.downloadAudio()
      return
    }

    this.checkDynamicPlaylist()
  }

  private async checkDynamicPlaylist(): Promise<void> {
    const requestId = randomUUID()
    this.logger.debug('--> checkDynamicPlaylist', { requestId })
    try {
      const { data } = await axios.get<string>(this.dynamicPlaylistUrl)
      this.logger.debug('<-- checkDynamicPlaylist', { requestId })
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
      this.logger.error(`checkDynamicPlaylist: ${error.message}`, { requestId })
    }
    const ms = APP_PLAYLIST_REFRESH_INTERVAL
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
        await this.processDownload()
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

  private async processDownload() {
    this.logger.debug('processDownload')
    try {
      // Get latest metadata in case title changed
      await this.getSpaceMetadata()
    } catch (error) {
      this.logger.warn(`processDownload: ${error.message}`)
    }
    this.downloadAudio()
    this.downloadCaptions()
  }

  private async downloadAudio() {
    try {
      const metadata = {
        title: this.spaceTitle,
        author: this.userDisplayName,
        artist: this.userDisplayName,
        episode_id: this.spaceId,
      }
      this.logger.info(`File name: ${this.filename}`)
      this.logger.info(`File metadata: ${JSON.stringify(metadata)}`)
      if (!this.downloader) {
        this.downloader = new SpaceDownloader(
          this.dynamicPlaylistUrl,
          this.filename,
          this.userScreenName,
          metadata,
        )
      }
      await this.downloader.download()
      this.emit('complete')
    } catch (error) {
      const ms = 10000
      // Attemp to download transcode playlist right after space end could return 404
      this.logger.error(`downloadAudio: ${error.message}`)
      this.logger.info(`Retry download audio in ${ms}ms`)
      setTimeout(() => this.downloadAudio(), ms)
    }
  }

  private async downloadCaptions() {
    if (!this.accessChatData) {
      return
    }
    try {
      const username = this.userScreenName
      const tmpFile = path.join(Util.getMediaDir(username), `${this.filename} CC.jsonl`)
      const outFile = path.join(Util.getMediaDir(username), `${this.filename} CC.txt`)
      Util.createMediaDir(username)
      await new SpaceCaptionsDownloader(
        this.spaceId,
        this.accessChatData.endpoint,
        this.accessChatData.access_token,
        tmpFile,
      ).download()
      await new SpaceCaptionsExtractor(tmpFile, outFile).extract()
    } catch (error) {
      this.logger.error(`downloadCaptions: ${error.message}`)
    }
  }

  private async showNotification() {
    if (!program.getOptionValue('notification') || this.isNotificationNotified) {
      return
    }
    this.isNotificationNotified = true
    const notification = new Notification(
      {
        title: `${this.userDisplayName || ''} Space Live!`.trim(),
        message: `${this.spaceTitle || ''}`,
        icon: this.userProfileImgUrl,
      },
      this.spaceUrl,
    )
    notification.notify()
  }

  private sendWebhooks() {
    const webhook = new Webhook(
      this.userScreenName,
      this.spaceId,
      {
        author: {
          name: `${this.userDisplayName} (@${this.userScreenName})`.trim(),
          url: TwitterUtil.getUserUrl(this.userScreenName),
          iconUrl: this.userProfileImgUrl,
        },
        space: { title: this.spaceTitle },
      },
    )
    webhook.send()
  }
}
