import axios from 'axios'
// eslint-disable-next-line camelcase
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { config } from './config'
import logger from './logger'
import { Util } from './Util'

export class Downloader {
  public static getMediaDir(): string {
    const dir = path.join(__dirname, config.app.mediaDir)
    return dir
  }

  public static createMediaDir(): string {
    return fs.mkdirSync(this.getMediaDir(), { recursive: true })
  }

  public static async downloadMedia(url: string, fileName: string): Promise<void> {
    const masterUrl = Util.getMasterUrlFromDynamicUrl(url)
    const playlistFileName = `${fileName}.m3u8`
    const mediaFileName = `${fileName}.aac`
    logger.info(`StreamMasterUrl: ${masterUrl}`)
    await this.downloadMediaPlaylist(masterUrl, playlistFileName)
    this.runFfmpeg(
      path.join(this.getMediaDir(), playlistFileName),
      path.join(this.getMediaDir(), mediaFileName),
    )
  }

  public static async downloadMediaPlaylist(url: string, fileName: string): Promise<void> {
    const data = await this.getMediaPlaylist(url)
    const filePath = path.join(this.getMediaDir(), fileName)
    this.createMediaDir()
    fs.writeFileSync(filePath, data)
    logger.verbose(`[Playlist] Saved to: ${filePath}`)
  }

  public static async getMediaPlaylist(url: string): Promise<string> {
    const { data: noneTranscodePlaylistData } = await axios.get<string>(url)
    const transcodePlaylistUrl = new URL(url).origin + noneTranscodePlaylistData.split('\n')[3]
    logger.info(`Playlist url: ${transcodePlaylistUrl}`)
    const transcodePlaylistRes = await axios.get<string>(transcodePlaylistUrl)
    const { data: transcodePlaylistData } = transcodePlaylistRes
    const chunkRegex = /^chunk/gm
    logger.info(`Playlis content length: ${Number(transcodePlaylistRes.headers['content-length'])}`)
    logger.info(`Playlis chunk count: ${transcodePlaylistData.match(chunkRegex).length}`)
    const masterUrlWithoutExt = url.replace('master_playlist.m3u8', '')
    const result = transcodePlaylistData.replace(chunkRegex, `${masterUrlWithoutExt}chunk`)
    return result
  }

  public static runFfmpeg(playlistPath: string, mediaPath: string): void {
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
    logger.verbose(`[Audio] Saving to: ${mediaPath}`)
    logger.verbose(`${cmd} ${args.join(' ')}`)
    this.createMediaDir()
    if (process.platform === 'win32') {
      child_process.spawn('cmd', ['/c', [cmd, ...args].join(' ')], { detached: true, stdio: 'ignore' })
    } else {
      child_process.spawn(cmd, args, { detached: true, stdio: 'ignore' })
    }
  }
}
