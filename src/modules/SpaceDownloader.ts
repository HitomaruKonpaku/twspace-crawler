import axios from 'axios'
import { spawn, SpawnOptions } from 'child_process'
import { writeFileSync } from 'fs'
import path from 'path'
import winston from 'winston'
import { writeFFMetadata } from 'ffmetadata1'
import { quote } from 'shell-quote'
import { PeriscopeApi } from '../apis/PeriscopeApi'
import { logger as baseLogger } from '../logger'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'
import { Util } from '../utils/Util'

export class SpaceDownloader {
  private logger: winston.Logger

  private playlistUrl: string
  private playlistFile: string
  private audioFile: string
  private metadataFile: string
  private args: string[]

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
    this.metadataFile = path.join(Util.getMediaDir(subDir), `${filename}.ffm1`)
    this.logger.verbose(`Playlist path: "${this.playlistFile}"`)
    this.logger.verbose(`Audio path: "${this.audioFile}"`)
    this.logger.verbose(`Metadata path: "${this.metadataFile}"`)
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

  private async spawnFfmpeg() {
    const cmd = 'ffmpeg'
    this.args = [
      '-protocol_whitelist',
      'file,https,tls,tcp',
      '-f',
      'hls',
      '-i',
      // this.playlistFile,
      this.playlistUrl,
    ]

    if (this.metadata) {
      this.logger.debug('Audio metadata', this.metadata)
      await writeFFMetadata(this.metadata, this.metadataFile)
      this.args.push(...['-f', 'ffmetadata', '-i', this.metadataFile])
    }

    this.args.push(...['-c', 'copy', this.audioFile])
    this.logger.verbose(`Audio is saving to "${this.audioFile}"`)

    // Shell quote args so user can copy and paste to debug ffmpeg.
    const outargs = new Array([...this.args]).map((v) => quote(v)).join(' ')
    this.logger.verbose(`${cmd} ${outargs}`)

    // https://github.com/nodejs/node/issues/21825
    const spawnOptions: SpawnOptions = {
      cwd: process.cwd(),
      stdio: 'ignore',
      detached: false,
      windowsHide: true,
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cp = process.platform === 'win32'
      ? spawn(process.env.comspec, ['/c', cmd, ...this.args], spawnOptions)
      : spawn(cmd, this.args, spawnOptions)
    // cp.unref()

    return cp
  }
}
