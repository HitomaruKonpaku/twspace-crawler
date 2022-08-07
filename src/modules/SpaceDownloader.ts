import axios from 'axios'
import { spawn, SpawnOptions } from 'child_process'
import { writeFileSync } from 'fs'
import path from 'path'
import winston from 'winston'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { logger as baseLogger } from '../logger'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { Util } from '../utils/Util'

export class SpaceDownloader {
  private logger: winston.Logger

  private playlistUrl: string
  private playlistFile: string
  private audioFile: string

  constructor(
    private readonly originUrl: string,
    private readonly filename: string,
    private readonly subDir = '',
    private readonly metadata?: Record<string, any>,
  ) {
    this.logger = baseLogger.child({ label: '[SpaceDownloader]' })
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
    // Util.createMediaDir(this.subDir)
    // await this.saveFinalPlaylist()
    Util.createMediaDir(this.subDir)
    this.spawnFfmpeg()
  }

  private async saveFinalPlaylist() {
    try {
      this.logger.debug(`--> saveFinalPlaylist: ${this.playlistUrl}`)
      const { data } = await axios.get<string>(this.playlistUrl)
      this.logger.debug(`<-- saveFinalPlaylist: ${this.playlistUrl}`)
      const prefix = PeriscopeUtil.getChunkPrefix(this.playlistUrl)
      this.logger.debug(`Chunk prefix: ${prefix}`)
      const newData = data.replace(/^chunk/gm, `${prefix}chunk`)
      writeFileSync(this.playlistFile, newData)
      this.logger.verbose(`Playlist saved to "${this.playlistFile}"`)
    } catch (error) {
      this.logger.debug(`saveFinalPlaylist: ${error.message}`)
      const status = error.response?.status
      if (status === 404 && this.originUrl !== this.playlistUrl) {
        this.playlistUrl = null
      }
      throw error
    }
  }

  private spawnFfmpeg() {
    const cmd = 'ffmpeg'
    const args = [
      '-protocol_whitelist',
      'file,https,tls,tcp',
      '-i',
      // this.playlistFile,
      this.playlistUrl,
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
    args.push(this.audioFile)
    this.logger.verbose(`Audio is saving to "${this.audioFile}"`)
    this.logger.verbose(`${cmd} ${args.join(' ')}`)

    // https://github.com/nodejs/node/issues/21825
    const spawnOptions: SpawnOptions = {
      cwd: process.cwd(),
      stdio: 'ignore',
      detached: false,
      windowsHide: true,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cp = process.platform === 'win32'
      ? spawn(process.env.comspec, ['/c', cmd, ...args], spawnOptions)
      : spawn(cmd, args, spawnOptions)
    // cp.unref()

    return cp
  }
}
