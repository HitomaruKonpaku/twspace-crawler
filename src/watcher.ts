import axios from 'axios'
import EventEmitter from 'events'
import { args } from './args'
import { config } from './config'
import logger from './logger'
import util from './util'

export class Watcher extends EventEmitter {
  public spaceId: string

  private guestToken: string
  private metadata: any
  private mediaKey: string
  private streamDynamicUrl: string
  private streamMasterUrl: string

  constructor(spaceId: string) {
    super()
    logger.info({ spaceId })
    this.spaceId = spaceId
  }

  private get apiHeaders() {
    const headers = {
      'authorization': process.env['AUTHORIZATION'],
      'x-guest-token': this.guestToken,
    }
    return headers
  }

  public async start() {
    try {
      await this.initData()
      this.checkPlaylist()
    } catch (error) {
      logger.error({ spaceId: this.spaceId, msg: error.message })
      debugger
    }
  }

  private async initData() {
    this.guestToken = await util.getGuestToken()
    logger.info({ spaceId: this.spaceId, guestToken: this.guestToken })
    const audioSpace = await util.getAudioSpaceById(this.spaceId, this.apiHeaders)
    this.metadata = audioSpace.metadata
    logger.info({ spaceId: this.spaceId, metadata: this.metadata })
    if (!this.metadata) {
      logger.warn({ msg: 'metadata not found' })
      return
    }
    this.mediaKey = this.metadata.media_key
    this.streamDynamicUrl = await util.getStreamDynamicUrl(this.mediaKey, this.apiHeaders)
    this.streamMasterUrl = util.getStreamMasterUrlFromDynamicUrl(this.streamDynamicUrl)
  }

  private async checkPlaylist() {
    const url = this.streamDynamicUrl
    let status: number
    try {
      logger.silly({ spaceId: this.spaceId, dynamicPlaylist: { url } })
      const res = await axios.head(url)
      status = res.status
      logger.info({ spaceId: this.spaceId, dynamicPlaylist: { status } })
      if (args.force) {
        util.downloadPlaylist(this.streamMasterUrl, Date.now() + '_' + this.spaceId)
        return
      }
      setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistCheckInterval)
    } catch (error) {
      status = error.response.status
      if (status !== 404) {
        logger.error({ spaceId: this.spaceId, msg: error.message, dynamicPlaylist: { status } })
        debugger
        setTimeout(() => this.checkPlaylist(), config.app.dynamicPlaylistCheckInterval)
        return
      }
      logger.info({ spaceId: this.spaceId, dynamicPlaylist: { status } })
      util.downloadPlaylist(this.streamMasterUrl, Date.now() + '_' + this.spaceId)
    }
  }
}
