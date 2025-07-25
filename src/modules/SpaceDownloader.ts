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
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { Util } from '../utils/Util'
import { configManager } from './ConfigManager'

export class SpaceDownloader {
  private logger: winston.Logger

  private playlistUrl: string
  private playlistFile: string
  private audioFile: string

  private readonly tmpDir = path.join('.tmp', this.id || randomUUID())
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
      originUrl, filename, subDir, metadata,
    })
    this.playlistFile = path.join(Util.getMediaDir(subDir), `${filename}.m3u8`)
    this.audioFile = path.join(Util.getMediaDir(subDir), `${filename}.m4a`)
    this.logger.verbose(`Playlist path: "${this.playlistFile}"`)
    this.logger.verbose(`Audio path: "${this.audioFile}"`)
  }

  public async download() {
    this.logger.debug('download', { playlistUrl: this.playlistUrl, originUrl: this.originUrl })

    if (!this.playlistUrl) {
      this.playlistUrl = await PeriscopeApi.getFinalPlaylistUrl(this.originUrl)
      this.logger.info(`Final playlist url: ${this.playlistUrl}`)
    }

    mkdirSync(this.tmpDir, { recursive: true })
    await this.downloadPlaylist()
    await this.downloadChunks()

    Util.createMediaDir(this.subDir)
    await this.spawnFfmpeg()

    rmSync(this.tmpDir, { recursive: true, force: true })
  }

  private async spawnFfmpeg() {
    const cmd = 'ffmpeg'
    const args = [
      // '-protocol_whitelist',
      // 'file,https,tls,tcp',
      '-i',
      this.tmpPlaylistFile,
      '-c',
      'copy',
    ]

    if (this.metadata) {
      this.logger.debug('Audio metadata', this.metadata)
      Object.keys(this.metadata).forEach((key) => {
        const value = this.metadata[key]
        if (!value) {
          return
        }
        args.push('-metadata', `${key}=${value}`)
      })
    }

    const { config } = configManager
    if (config?.ffmpegArgs?.length) {
      args.push(...config.ffmpegArgs)
    }

    args.push(this.audioFile)

    this.logger.verbose(`Audio is saving to "${this.audioFile}"`)
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

  private async downloadPlaylist() {
    const { data } = await axios.get<string>(this.playlistUrl)
    writeFileSync(path.join(this.tmpDir, this.tmpPlaylistFile), data)
  }

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
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(data)
    const index = buffer.indexOf(this.ignoreBuffer)
    if (index !== -1) {
      buffer = buffer.slice(index)
    }
    writeFileSync(path.join(this.tmpDir, chunkName), buffer)
  }
}
