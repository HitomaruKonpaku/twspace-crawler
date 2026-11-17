import axios from 'axios'
import Bottleneck from 'bottleneck'
import { spawn, SpawnOptions } from 'child_process'
import { randomUUID } from 'crypto'
import {
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'fs'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/periscope-api'
import { APP_DOWNLOAD_CHUNK_RETRY_MAX } from '../constants/app.constant'
import { logger as baseLogger } from '../logger'
import { BufferUtil } from '../utils/buffer.util'
import { M3u8Util } from '../utils/m3u8.util'
import { PeriscopeUtil } from '../utils/periscope.util'
import { Util } from '../utils/util'
import { configManager } from './config-manager'

/**
 * Download audio OR video
 *
 * @see https://github.com/yt-dlp/yt-dlp/pull/10789
 * @see https://github.com/HitomaruKonpaku/twspace-crawler/issues/93
 *
 */
export class SpaceDownloader {
  private logger: winston.Logger

  private playlistFile: string
  private resultFile: string
  private isVideo = false

  private readonly tmpDir = path.join('.tmp', [this.id, randomUUID()].filter((v) => v).join('_'))
  private readonly tmpPlaylistFile = 'playlist.m3u8'

  private readonly chunkLimiter = new Bottleneck({ maxConcurrent: 1 })

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
    this.initPlaylistFile()
    this.initResultFile()
  }

  private initPlaylistFile() {
    this.playlistFile = path.join(Util.getMediaDir(this.subDir), `${this.filename}.m3u8`)
    this.logger.verbose(`Playlist path: "${this.playlistFile}"`)
  }

  private initResultFile() {
    const { config } = configManager
    let ext = this.isVideo
      ? config?.ffmpeg?.video?.extension || 'mp4'
      : config?.ffmpeg?.audio?.extension || 'm4a'
    ext = ext.replace(/^\./, '')

    this.resultFile = path.join(Util.getMediaDir(this.subDir), `${this.filename}.${ext}`)
    this.logger.verbose(`Result path: "${this.resultFile}"`)
  }

  public async download() {
    this.logger.debug('download', {
      originUrl: this.originUrl,
    })
    const downloadStart = Date.now()
    const { url: playlistUrl, data, isVideo } = await PeriscopeApi.resolveFinalPlaylist(this.originUrl)
    this.logger.debug('download', {
      mediaType: isVideo ? 'video' : 'audio',
      playlistUrl,
    })
    this.logger.info(`Final playlist url: ${playlistUrl}`)
    if (this.isVideo !== isVideo) {
      this.isVideo = isVideo
      this.initResultFile()
    }

    mkdirSync(this.tmpDir, { recursive: true })
    Util.createMediaDir(this.subDir)

    if (this.isVideo) {
      await this.spawnFfmpeg(playlistUrl)
    } else {
      const manifest = M3u8Util.parse(data)
      await this.downloadChunks(playlistUrl, data, manifest.segments.map((segment) => segment.uri))
      await this.spawnFfmpeg(this.tmpPlaylistFile)
    }

    // Clean up tmp dir
    rmSync(this.tmpDir, { recursive: true, force: true })

    const downloadEnd = Date.now()
    this.logger.info('Download completed', {
      downloadTime: downloadEnd - downloadStart,
      downloadStart,
      downloadEnd,
    })
  }

  // #region audio

  private async downloadChunks(playlistUrl: string, data: string, segmentUris: string[]) {
    if (!segmentUris.length) {
      throw new Error('CHUNK_NOT_FOUND')
    }

    const localNames = new Map([...new Set(segmentUris)].map((uri, i) => [uri, `chunk_${i}.aac`]))
    const playlist = data.replace(/^[^#\r\n][^\r\n]*/gm, (line) => localNames.get(line.trim()) ?? line)
    writeFileSync(path.join(this.tmpDir, this.tmpPlaylistFile), playlist)
    let preferredArchiveCandidate = 0

    await Promise.all([...localNames].map(([uri, name], index) =>
      this.chunkLimiter.schedule(async () => {
        const urls = PeriscopeUtil.getChunkUrlCandidates(playlistUrl, uri)
        // Only unsigned bare chunks share the same archive candidates for this playlist.
        const canReuseArchive = urls.length > 1 && !uri.includes('?')
        const preferred = canReuseArchive
          ? preferredArchiveCandidate
          : 0
        const candidates = preferred
          ? [urls[preferred], ...urls.filter((_, i) => i !== preferred)]
          : urls
        const downloadedUrl = await this.downloadChunk(candidates, name, index + 1, localNames.size)
        if (canReuseArchive) {
          preferredArchiveCandidate = urls.indexOf(downloadedUrl)
        }
      }),
    ))
  }

  private async downloadChunk(urls: string[], chunkName: string, chunkIndex: number, total: number) {
    this.logger.debug(`downloadChunk: ${chunkName} (${chunkIndex}/${total})`, { candidates: urls.length })
    let candidate = 0
    for (let retries = 0; retries <= APP_DOWNLOAD_CHUNK_RETRY_MAX; retries++) {
      const url = urls[candidate]
      try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        const buffer = BufferUtil.stripIgnoreBuffer(data)
        writeFileSync(path.join(this.tmpDir, chunkName), buffer)
        return urls[candidate]
      } catch (error) {
        const status = error.response?.status
        // Legacy audio replays can reject the transcode chunk URL with HTTP 400.
        // Alternate URLs here are backing archive paths for bare audio chunks.
        if ((status === 400 || status === 404 || status === 410) && candidate + 1 < urls.length) {
          candidate++
        }
        const errMsg = `downloadChunk: "${chunkName}" download failed`
        const errParams = {
          chunkName,
          url,
          retries,
          status,
          message: error.response?.message ?? error.message,
        }
        if (retries >= APP_DOWNLOAD_CHUNK_RETRY_MAX) {
          this.logger.error(errMsg, errParams)
          // Axios errors retain request headers and URLs.
          throw error
        }
        this.logger.warn(errMsg, errParams)
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
    const mediaType = this.isVideo
      ? 'video'
      : 'audio'
    const mediaArgs = config?.ffmpeg?.[mediaType]?.args
    if (mediaArgs?.length > 0) {
      args.push(...mediaArgs)
    } else if (config?.ffmpegArgs?.length) {
      args.push(...config.ffmpegArgs)
    } else {
      args.push('-c', 'copy')
    }

    args.push(this.resultFile)

    this.logger.debug(`${cmd} ${args.join(' ')}`)
    this.logger.verbose('Starting FFmpeg', {
      mediaType,
      input: inp,
      customArgs: Boolean(mediaArgs?.length || config?.ffmpegArgs?.length),
    })
    this.logger.verbose(`File is saving to "${this.resultFile}"`)

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
