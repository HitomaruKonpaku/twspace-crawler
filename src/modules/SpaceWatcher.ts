import axios from 'axios'
import { program } from 'commander'
import EventEmitter from 'events'
import open from 'open'
import path from 'path'
import winston from 'winston'

import { AudioSpace } from '../api/interface/twitter-graphql.interface'
import { api } from '../api/twitter.api'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { APP_PLAYLIST_CHUNK_VERIFY_MAX_RETRY, APP_PLAYLIST_REFRESH_INTERVAL, APP_SPACE_ERROR_RETRY_INTERVAL } from '../constants/app.constant'
import { SpaceState } from '../enums/Twitter.enum'
import { AccessChat } from '../interfaces/Periscope.interface'
import { LiveVideoStreamStatus } from '../interfaces/Twitter.interface'
import { logger as baseLogger, spaceLogger, spaceRawLogger } from '../logger'
import { TwitterSpace } from '../model/twitter-space'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { SpaceUtil } from '../utils/SpaceUtil'
import { TwitterUtil } from '../utils/TwitterUtil'
import { Util } from '../utils/Util'
import { TwitterEntityUtil } from '../utils/twitter-entity.util'
import { configManager } from './ConfigManager'
import { Notification } from './Notification'
import { SpaceCaptionsDownloader } from './SpaceCaptionsDownloader'
import { SpaceCaptionsExtractor } from './SpaceCaptionsExtractor'
import { SpaceDownloader } from './SpaceDownloader'
import { Webhook } from './Webhook'

export class SpaceWatcher extends EventEmitter {
  private logger: winston.Logger
  private downloader: SpaceDownloader

  private audioSpace: AudioSpace
  private liveStreamStatus: LiveVideoStreamStatus
  private accessChatData: AccessChat
  private dynamicPlaylistUrl: string

  private space: TwitterSpace

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

  private get filename(): string {
    const time = Util.getDateTimeString(this.space?.startedAt || this.space?.createdAt)
    const name = `[${this.space?.creator?.username}][${time}] ${Util.getCleanFileName(this.space?.title) || 'NA'} (${this.spaceId})`
    return name
  }

  public async watch(): Promise<void> {
    this.logger.info('Watching...')
    this.logger.info(`Space url: ${this.spaceUrl}`)
    try {
      await this.initData()
    } catch (error) {
      if (this.audioSpace?.metadata) {
        this.logger.error(`watch: ${error.message}`)
      }
      const ms = APP_SPACE_ERROR_RETRY_INTERVAL
      this.logger.info(`Retry watch in ${ms}ms`)
      setTimeout(() => this.watch(), ms)
    }
  }

  // #region log

  private logSpaceInfo() {
    const payload = {
      id: this.spaceId,
      creatorId: this.space.creatorId,
      username: this.space?.creator?.username,
      scheduled_start: this.space?.scheduledStart,
      started_at: this.space?.startedAt,
      ended_at: this.space?.endedAt,
      title: this.space?.title || null,
      playlist_url: PeriscopeUtil.getMasterPlaylistUrl(this.dynamicPlaylistUrl),
    }
    spaceLogger.info(payload)
    this.logger.info('Space info', payload)
  }

  private logSpaceAudioDuration() {
    if (!this.space?.endedAt || !this.space?.startedAt) {
      return
    }
    const ms = Number(this.space.endedAt) - this.space.startedAt
    const duration = Util.getDisplayTime(ms)
    this.logger.info(`Expected audio duration: ${duration}`)
  }

  // #endregion

  // #region check

  private async checkDynamicPlaylist(): Promise<void> {
    this.logger.debug('--> checkDynamicPlaylist')
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
        // Space ended / Host disconnected
        this.logger.info(`Dynamic playlist status: ${status}`)
        this.checkMasterPlaylist()
        return
      }
      this.logger.error(`checkDynamicPlaylist: ${error.message}`)
    }
    this.checkDynamicPlaylistWithTimer()
  }

  private async checkMasterPlaylist(): Promise<void> {
    this.logger.debug('--> checkMasterPlaylist')
    try {
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
    this.checkMasterPlaylistWithTimer()
  }

  private checkDynamicPlaylistWithTimer(ms = APP_PLAYLIST_REFRESH_INTERVAL) {
    setTimeout(() => this.checkDynamicPlaylist(), ms)
  }

  private checkMasterPlaylistWithTimer(ms = APP_PLAYLIST_REFRESH_INTERVAL) {
    this.logger.info(`Recheck master playlist in ${ms}ms`)
    setTimeout(() => this.checkMasterPlaylist(), ms)
  }

  // #endregion

  // #region space

  private async initData() {
    if (!this.audioSpace?.metadata) {
      await this.getSpaceData()
      if (this.space?.state === SpaceState.LIVE) {
        this.showNotification()
      }
    }

    // Download space by url with available metadata
    this.dynamicPlaylistUrl = program.getOptionValue('url')
    if (this.dynamicPlaylistUrl) {
      this.downloadAudio()
      return
    }

    if (this.space?.state === SpaceState.CANCELED) {
      this.logger.warn('Space canceled')
      return
    }

    if (this.space?.state === SpaceState.ENDED && !this.space?.isAvailableForReplay) {
      this.logger.warn('Space archive not available')
      return
    }

    if (!this.liveStreamStatus) {
      this.logger.debug('--> getLiveVideoStreamStatus')
      const { data } = await api.liveVideoStream.status(this.audioSpace.metadata.media_key)
      this.liveStreamStatus = data
      this.logger.debug('<-- getLiveVideoStreamStatus')
      this.logger.debug('liveStreamStatus', this.liveStreamStatus)
    }

    if (!this.dynamicPlaylistUrl) {
      this.dynamicPlaylistUrl = this.liveStreamStatus.source.location
      this.logger.info(`Master playlist url: ${PeriscopeUtil.getMasterPlaylistUrl(this.dynamicPlaylistUrl)}`)
      this.buildSpace()
      this.logSpaceInfo()

      if (this.space?.state === SpaceState.LIVE) {
        this.sendWebhooks()
      }
    }

    if (!this.accessChatData) {
      this.logger.debug('--> getAccessChat')
      this.accessChatData = await PeriscopeApi.getAccessChat(this.liveStreamStatus.chatToken)
      this.logger.debug('<-- getAccessChat')
      this.logger.debug('accessChat data', this.accessChatData)
      this.logger.info(`Chat endpoint: ${this.accessChatData.endpoint}`)
      this.logger.info(`Chat access token: ${this.accessChatData.access_token}`)
    }

    if (this.space?.state === SpaceState.ENDED) {
      this.processDownload()
      return
    }

    // Force download space
    if (program.getOptionValue('force')) {
      this.downloadAudio()
      return
    }

    this.checkDynamicPlaylist()
  }

  private buildSpace() {
    const space = TwitterEntityUtil.buildSpaceByAudioSpace(this.audioSpace)
    this.space = space
    if (this.dynamicPlaylistUrl) {
      this.space.playlistUrl = PeriscopeUtil.getMasterPlaylistUrl(this.dynamicPlaylistUrl)
    }
  }
  // #endregion

  // #region audio space

  public async getAudioSpaceById() {
    try {
      const { data } = await api.graphql.AudioSpaceById(this.spaceId)
      const audioSpace = data?.data?.audioSpace as AudioSpace
      delete audioSpace.sharings
      this.logger.info('getAudioSpaceById', { audioSpace })
      if (audioSpace.metadata?.rest_id || audioSpace.rest_id) {
        spaceRawLogger.info({ type: 'AudioSpaceById', data: audioSpace })
      }
      return audioSpace
    } catch (error) {
      this.logger.error(`getAudioSpaceById: ${error.message}`)
      return null
    }
  }

  public async getAudioSpaceByRestId() {
    try {
      const { data } = await api.graphql.AudioSpaceByRestId(this.spaceId)
      const audioSpace = data?.data?.audio_space_by_rest_id as AudioSpace
      delete audioSpace.sharings
      this.logger.info('getAudioSpaceByRestId', { audioSpace })
      if (audioSpace.metadata?.rest_id || audioSpace.rest_id) {
        spaceRawLogger.info({ type: 'AudiospaceByRestId', data: audioSpace })
      }
      return audioSpace
    } catch (error) {
      this.logger.error(`getAudioSpaceByRestId: ${error.message}`)
      return null
    }
  }

  private async getSpaceData() {
    this.logger.debug('--> getSpaceData')
    const audioSpaces = await Promise.all([
      this.getAudioSpaceById(),
      this.getAudioSpaceByRestId(),
    ])

    const hasMetadata = audioSpaces.some((v) => v?.metadata)
    if (!hasMetadata) {
      this.logger.error('AudioSpace metadata not found')
      return
    }

    this.audioSpace = audioSpaces.find((v) => v?.metadata)
    this.buildSpace()
    this.logger.debug('<-- getSpaceData')
  }

  // #endregion

  // #region download

  private async processDownload() {
    this.logger.debug('processDownload')
    try {
      // Save metadata before refetch
      const prevState = this.space?.state

      // Get latest metadata in case title changed
      await this.getSpaceData()
      this.logSpaceInfo()

      if (this.space?.state === SpaceState.LIVE) {
        // Recheck dynamic playlist in case host disconnect for a long time
        this.checkDynamicPlaylistWithTimer()
        return
      }

      if (this.space?.state === SpaceState.ENDED && prevState === SpaceState.LIVE) {
        this.sendWebhooks()
      }
    } catch (error) {
      this.logger.warn(`processDownload: ${error.message}`)
    }
    this.downloadAudio()
    this.downloadCaptions()
  }

  private async downloadAudio() {
    this.logSpaceAudioDuration()

    if (configManager.skipDownload || configManager.skipDownloadAudio) {
      return
    }

    try {
      const metadata = {
        title: this.space?.title,
        author: this.space?.creator?.username,
        artist: this.space?.creator?.username,
        episode_id: this.spaceId,
      }
      this.logger.info(`File name: ${this.filename}`)
      this.logger.info(`File metadata: ${JSON.stringify(metadata)}`)
      if (!this.downloader) {
        this.downloader = new SpaceDownloader(
          this.dynamicPlaylistUrl,
          this.filename,
          this.space?.creator?.username,
          metadata,
          this.spaceId,
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
    if (configManager.skipDownload || configManager.skipDownloadCaption) {
      return
    }

    if (!this.accessChatData) {
      return
    }

    try {
      const username = this.space?.creator?.username
      const tmpFile = path.join(Util.getMediaDir(username), `${this.filename} CC.jsonl`)
      const outFile = path.join(Util.getMediaDir(username), `${this.filename} CC.txt`)
      Util.createMediaDir(username)
      await new SpaceCaptionsDownloader(
        this.spaceId,
        this.accessChatData.endpoint,
        this.accessChatData.access_token,
        tmpFile,
      ).download()
      await new SpaceCaptionsExtractor(tmpFile, outFile, this.space?.startedAt).extract()
    } catch (error) {
      this.logger.error(`downloadCaptions: ${error.message}`)
    }
  }

  // #endregion

  // #region notification

  private async showNotification() {
    if (!program.getOptionValue('notification') || this.isNotificationNotified) {
      return
    }
    this.isNotificationNotified = true
    const notification = new Notification(
      {
        title: `${this.space?.creator?.name || ''} Space Live!`.trim(),
        message: `${this.space?.title || ''}`,
        icon: SpaceUtil.getHostProfileImgUrl(this.audioSpace),
      },
      this.spaceUrl,
    )
    notification.notify()
  }

  // #endregion

  // #region webhook

  private sendWebhooks() {
    const webhook = new Webhook(this.space, this.audioSpace)
    webhook.send()
  }

  // #endregion
}
