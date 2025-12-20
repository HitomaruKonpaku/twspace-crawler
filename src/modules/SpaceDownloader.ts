import axios from 'axios'
import Bottleneck from 'bottleneck'
import { spawn, SpawnOptions } from 'child_process'
import { randomUUID } from 'crypto'
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { logger as baseLogger } from '../logger'
import { M3u8Util } from '../utils/m3u8.util'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { Util } from '../utils/Util'
import { configManager } from './ConfigManager'

/**
 * Download audio OR video
 *
 * @see https://github.com/yt-dlp/yt-dlp/pull/10789
 * @see https://github.com/HitomaruKonpaku/twspace-crawler/issues/93
 *
 */
export class SpaceDownloader {
  private logger: winston.Logger

  private playlistUrl: string
  private playlistFile: string
  private resultFile: string
  private isVideo = false

  private readonly MAX_RETRIES = 3

  private readonly tmpDir = path.join('.tmp', [this.id, randomUUID()].filter((v) => v).join('_'))
  private readonly tmpPlaylistFile = 'playlist.m3u8'

  private readonly chunkLimiter = new Bottleneck({ maxConcurrent: 5 })

  /**
   * @see https://github.com/HoloArchivists/tslazer/commit/56ba5e11cc4c1a6bab1845e835f7fc4de4babb99
   */
  private readonly ignoreBuffer = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3F, 0x50, 0x52, 0x49, 0x56])

  constructor(
    private readonly originUrl: string,
    private readonly filename: string,
    private readonly subDir = '',
    private readonly metadata?: Record<string, any>,
    private readonly id?: string,
  ) {
    this.id = this.id || randomUUID()
    this.logger = baseLogger.child({ label: `[SpaceDownloader@${this.id}]` })
    this.logger.debug('constructor', {
      originUrl,
      filename,
      subDir,
      metadata,
    })
    this.initPaylistFile()
    this.initResultFile()
  }

  private initPaylistFile() {
    this.playlistFile = path.join(Util.getMediaDir(this.subDir), `${this.filename}.m3u8`)
    this.logger.verbose(`Playlist path: "${this.playlistFile}"`)
  }

  private initResultFile() {
    const { config } = configManager
    const mediaKey = this.isVideo ? 'video' : 'audio'
    let extConfig = config?.ffmpeg?.[mediaKey]?.extension
    
    if (extConfig && extConfig.startsWith('.')) {
      extConfig = extConfig.slice(1)
    }

    let ext
    if (extConfig) {
      ext = extConfig
    } else {
      ext = this.isVideo ? 'mp4' : 'm4a'
    }

    this.resultFile = path.join(Util.getMediaDir(this.subDir), `${this.filename}.${ext}`)
    this.logger.verbose(`Result path: "${this.resultFile}"`)
  }

  public async download() {
    this.logger.debug('download', { playlistUrl: this.playlistUrl, originUrl: this.originUrl })
    const downloadStart = Date.now()

    if (!this.playlistUrl) {
      this.playlistUrl = await PeriscopeApi.getFinalPlaylistUrl(this.originUrl)
      this.logger.info(`Final playlist url: ${this.playlistUrl}`)
    }

    let data = await axios.get<string>(this.playlistUrl).then((v) => v.data)
    const manifest = M3u8Util.parse(data)
    if (manifest.playlists?.length) {
      const item = manifest.playlists.sort((a, b) => b.attributes.RESOLUTION.height - a.attributes.RESOLUTION.height || b.attributes.RESOLUTION.width - a.attributes.RESOLUTION.width)[0]
      this.playlistUrl = new URL(item.uri, this.playlistUrl).href
      this.logger.info(`Final playlist url: ${this.playlistUrl}`)

      data = await axios.get<string>(this.playlistUrl).then((v) => v.data)
      this.isVideo = true
      this.initResultFile()
    }

    mkdirSync(this.tmpDir, { recursive: true })
    Util.createMediaDir(this.subDir)

    if (this.isVideo) {
      await this.spawnFfmpeg(this.playlistUrl)
    } else {
      writeFileSync(path.join(this.tmpDir, this.tmpPlaylistFile), data)
      await this.downloadChunks()
      await this.spawnFfmpeg(this.tmpPlaylistFile)
    }

    rmSync(this.tmpDir, { recursive: true, force: true })

    const downloadEnd = Date.now()
    this.logger.info('Download completed', {
      downloadTime: downloadEnd - downloadStart,
      downloadStart,
      downloadEnd,
    })
  }

  // #region audio

  private async downloadChunks() {
    const m3u8 = readFileSync(path.join(this.tmpDir, this.tmpPlaylistFile), 'utf8')
    const chunks = m3u8.match(/chunk_[\w.]*/g)
    if (!chunks.length) {
      throw new Error('CHUNK_NOT_FOUND')
    }

    const chunkBaseUrl = PeriscopeUtil.getChunkPrefix(this.playlistUrl)
    await Promise.all(chunks.map((v) => this.chunkLimiter.schedule(() => this.downloadChunk(chunkBaseUrl, v))))
  }

  private async downloadChunk(chunkBaseUrl: string, chunkName: string) {
    const url = chunkBaseUrl + chunkName
    this.logger.debug(`downloadChunk: ${chunkName}`)

    // eslint-disable-next-line no-plusplus
    for (let retries = 0; retries <= this.MAX_RETRIES; retries++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        let buffer = Buffer.from(data)
        const index = buffer.indexOf(this.ignoreBuffer)
        if (index !== -1) {
          buffer = buffer.slice(index)
        }
        writeFileSync(path.join(this.tmpDir, chunkName), buffer)
        return
      } catch (error) {
        if (retries >= this.MAX_RETRIES) {
          this.logger.error(`downloadChunk: ${error.message}`, { chunkName, url, retries })
          throw error
        }
        this.logger.warn(`downloadChunk: ${error.message}`, { chunkName, url, retries })
      }
    }
  }

  // #endregion

  // #region ffmpeg

  private async spawnFfmpeg(inp: string) {
    const cmd = 'ffmpeg'
    const args = [
      // '-protocol_whitelist',
      // 'file,https,tls,tcp',
      '-i',
      inp,
      '-seg_max_retry',
      '3',
    ]

    if (this.metadata) {
      this.logger.debug('File metadata', this.metadata)
      Object.keys(this.metadata).forEach((key) => {
        const value = this.metadata[key]
        if (!value) {
          return
        }
        args.push('-metadata', `${key}=${value}`)
      })
    }

    const { config } = configManager

    const mediaKey = this.isVideo ? 'video' : 'audio'
    const mediaArgs = (config?.ffmpeg?.[mediaKey]?.args || [])
    if (mediaArgs.length > 0) {
      args.push(...mediaArgs)
    } else if (config?.ffmpegArgs?.length) {
      args.push(...config.ffmpegArgs)
    } else {
      args.push('-c', 'copy')
    }

    args.push(this.resultFile)

    this.logger.verbose(`File is saving to "${this.resultFile}"`)
    this.logger.verbose(`${cmd} ${args.join(' ')}`)

    const cwd = path.join(process.cwd(), this.tmpDir)
    // https://github.com/nodejs/node/issues/21825
    const spawnOptions: SpawnOptions = {
      cwd,
      stdio: 'ignore',
      detached: false,
      windowsHide: true,
    }
    const cp = process.platform === 'win32'
      ? spawn(process.env.comspec, ['/c', cmd, ...args], spawnOptions)
      : spawn(cmd, args, spawnOptions)
    // cp.unref()

    return new Promise((resolve, reject) => {
      cp.once('error', (error) => {
        reject(error)
      })

      cp.once('close', (code) => {
        resolve(code)
      })
    })
  }

  // #endregion
}
