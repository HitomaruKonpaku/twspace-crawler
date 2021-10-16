import axios from 'axios'
// eslint-disable-next-line camelcase
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { APP_MEDIA_DIR } from './constants/app.constant'
import { logger } from './logger'
import { Util } from './Util'

export class Downloader {
  public static getMediaDir(subDir = ''): string {
    const dir = path.join(__dirname, APP_MEDIA_DIR, subDir)
    return dir
  }

  public static createMediaDir(subDir = ''): string {
    return fs.mkdirSync(this.getMediaDir(subDir), { recursive: true })
  }

  public static async downloadMedia(url: string, fileName: string, subDir = ''): Promise<void> {
    const masterUrl = Util.getMasterUrlFromDynamicUrl(url)
    logger.info(`Playlist master url: ${masterUrl}`)
    const playlistPath = path.join(this.getMediaDir(subDir), `${fileName}.m3u8`)
    const mediaPath = path.join(this.getMediaDir(subDir), `${fileName}.aac`)
    this.createMediaDir(subDir)
    await this.downloadMediaPlaylist(masterUrl, playlistPath)
    this.runFfmpeg(playlistPath, mediaPath)
  }

  public static async downloadMediaPlaylist(url: string, filePath: string): Promise<void> {
    const data = await this.getMediaPlaylist(url)
    fs.writeFileSync(filePath, data)
    logger.verbose(`Playlist saved to: ${filePath}`)
  }

  public static async getMediaPlaylist(url: string): Promise<string> {
    const { data: noneTranscodePlaylistData } = await axios.get<string>(url)
    const transcodePlaylistUrl = new URL(url).origin + noneTranscodePlaylistData.split('\n')[3]
    logger.info(`TranscodePlaylist url: ${transcodePlaylistUrl}`)
    const transcodePlaylistRes = await axios.get<string>(transcodePlaylistUrl)
    const { data: transcodePlaylistData } = transcodePlaylistRes
    const chunkRegex = /^chunk/gm
    logger.info(`Playlis content length: ${Number(transcodePlaylistRes.headers['content-length'])}`)
    logger.info(`Playlis chunk count: ${transcodePlaylistData.match(chunkRegex).length}`)
    const masterUrlWithoutExt = url.replace('master_playlist.m3u8', '')
    const result = transcodePlaylistData.replace(chunkRegex, `${masterUrlWithoutExt}chunk`)
    return result
  }

  private static runFfmpeg(playlistPath: string, mediaPath: string): void {
    const cmd = 'ffmpeg'
    const args = [
      '-protocol_whitelist',
      'file,https,tls,tcp',
      '-i',
      playlistPath,
      '-c',
      'copy',
      mediaPath,
    ]
    logger.verbose(`Audio saving to: ${mediaPath}`)
    logger.verbose(`${cmd} ${args.join(' ')}`)
    this.createMediaDir()
    if (process.platform === 'win32') {
      child_process.spawn('cmd', ['/c', [cmd, ...args].join(' ')], { detached: true, stdio: 'ignore' })
    } else {
      child_process.spawn(cmd, args, { detached: true, stdio: 'ignore' })
    }
  }
}
