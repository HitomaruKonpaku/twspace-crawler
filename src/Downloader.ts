import axios from 'axios'
// eslint-disable-next-line camelcase
import child_process, { SpawnOptions } from 'child_process'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import { logger as baseLogger } from './logger'
import { Util } from './Util'

const logger = baseLogger.child({ label: '[Downloader]' })

export class Downloader {
  public static async downloadImage(url: string, filePath: string) {
    logger.debug('Download image', { url, filePath })
    const response = await axios.get(url, { responseType: 'stream' })
    const writer = fs.createWriteStream(filePath)
    response.data.pipe(writer)
    await promisify(stream.finished)(writer)
  }

  public static async downloadSpace(nonTranscodePlaylistUrl: string, filename: string, subDir = '', metadata?: Record<string, any>) {
    const playlistPath = path.join(Util.getMediaDir(subDir), `${filename}.m3u8`)
    logger.verbose(`Playlist path: "${playlistPath}"`)
    Util.createMediaDir(subDir)
    await this.downloadSpacePlaylist(nonTranscodePlaylistUrl, playlistPath)
    const audioPath = path.join(Util.getMediaDir(subDir), `${filename}.m4a`)
    logger.verbose(`Audio path: "${audioPath}"`)
    this.runFfmpeg(playlistPath, audioPath, metadata)
  }

  public static async downloadSpacePlaylist(nonTranscodePlaylistUrl: string, filePath: string) {
    const data = await this.getAbsoluteTranscodePlaylist(nonTranscodePlaylistUrl)
    fs.writeFileSync(filePath, data)
    logger.verbose(`Playlist saved to: "${filePath}"`)
  }

  public static async getAbsoluteTranscodePlaylist(nonTranscodePlaylistUrl: string) {
    const nonTranscodeMasterPlaylistUrl = Util.getMasterUrlFromDynamicUrl(nonTranscodePlaylistUrl)
    logger.debug('getAbsoluteTranscodePlaylist', { nonTranscodePlaylistUrl, nonTranscodeMasterPlaylistUrl })
    const baseAudioUrl = nonTranscodeMasterPlaylistUrl.replace('master_playlist.m3u8', '')
    const chunkPattern = /^chunk/gm
    const rawData = await this.getRawTranscodePlaylist(nonTranscodePlaylistUrl)
    const data = rawData.replace(chunkPattern, `${baseAudioUrl}chunk`)
    return data
  }

  public static async getRawTranscodePlaylist(nonTranscodePlaylistUrl: string) {
    // eslint-disable-next-line max-len
    const nonTranscodePlaylistData = await Downloader.getNonTranscodeMasterPlaylist(nonTranscodePlaylistUrl)
    const transcodePlaylistUrl = new URL(nonTranscodePlaylistUrl).origin + nonTranscodePlaylistData.split('\n')[3]
    logger.debug('getRawTranscodePlaylist', { nonTranscodePlaylistUrl, transcodePlaylistUrl })
    const { data, headers } = await axios.get<string>(transcodePlaylistUrl)
    logger.debug('getRawTranscodePlaylist', { headers })
    return data
  }

  public static async getNonTranscodeMasterPlaylist(nonTranscodePlaylistUrl: string) {
    const nonTranscodeMasterPlaylistUrl = Util.getMasterUrlFromDynamicUrl(nonTranscodePlaylistUrl)
    logger.debug('getNonTranscodeMasterPlaylist', { nonTranscodePlaylistUrl, nonTranscodeMasterPlaylistUrl })
    const { data, headers } = await axios.get<string>(nonTranscodeMasterPlaylistUrl)
    logger.debug('getNonTranscodeMasterPlaylist', { headers })
    return data
  }

  private static runFfmpeg(
    playlistPath: string,
    mediaPath: string,
    metadata?: Record<string, any>,
  ) {
    const cmd = 'ffmpeg'
    const args = [
      '-protocol_whitelist',
      'file,https,tls,tcp',
      '-i',
      playlistPath,
      '-c',
      'copy',
    ]
    if (metadata) {
      logger.debug('Metadata', metadata)
      Object.keys(metadata).forEach((key) => {
        const value = metadata[key]
        if (!value) {
          return
        }
        args.push('-metadata', `${key}=${value}`)
      })
    }
    args.push(mediaPath)
    logger.verbose(`Audio saving to: "${mediaPath}"`)
    logger.verbose(`${cmd} ${args.join(' ')}`)
    Util.createMediaDir()

    const spawnOptions: SpawnOptions = { detached: true, stdio: 'ignore' }
    const cp = process.platform === 'win32'
      ? child_process.spawn(process.env.comspec, ['/c', cmd, ...args], spawnOptions)
      : child_process.spawn(cmd, args, spawnOptions)
    cp.unref()
  }
}
