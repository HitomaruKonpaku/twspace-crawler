import axios from 'axios'
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { config } from './config'
import logger from './logger'

export default {
  makeMediaDir() {
    fs.mkdirSync(path.join(__dirname, config.app.mediaDir), { recursive: true })
  },

  async getGuestToken() {
    const url = 'https://twitter.com'
    const res = await axios.get<string>(url)
    const data = res.data
    const token = /(?<=gt=)\d{19}/.exec(data)[0]
    return token
  },

  async getTweetSpaces(username: string) {
    const url = 'https://tweespaces-serverless-function.vercel.app/api/space-by-user'
    const body = { username }
    const res = await axios.post<any>(url, body)
    const data = res.data
    return data
  },

  async getTweetSpaceIdByTweetSpaces(username: string) {
    const data = await this.getTweetSpaces(username)
    const spaces: any[] = data.spaces.data
    if (!spaces?.length) {
      return null
    }
    const space = spaces[0]
    const id = space.id
    return id
  },

  async getAudioSpaceById(spaceId: string, headers?: Record<string, string>) {
    const url = new URL(config.twitter.apiPath.AudioSpaceById, config.twitter.baseApiUrl)
    const vars = {
      'id': spaceId,
      'isMetatagsQuery': false,
      'withSuperFollowsUserFields': false,
      'withUserResults': false,
      'withBirdwatchPivots': false,
      'withReactionsMetadata': false,
      'withReactionsPerspective': false,
      'withSuperFollowsTweetFields': false,
      'withReplays': false,
      'withScheduledSpaces': false,
    }
    url.searchParams.append('variables', JSON.stringify(vars))
    const href = url.href
    const res = await axios.get<any>(href, { headers })
    const data = res.data.data.audioSpace
    return data
  },

  getStreamMasterUrlFromDynamicUrl(dynamicUrl: string) {
    const masterUrl = dynamicUrl
      .replace('?type=live', '')
      .replace('dynamic', 'master')
    return masterUrl
  },

  async getStreamDynamicUrl(mediaKey: string, headers?: Record<string, string>) {
    const url = 'https://twitter.com/i/api/1.1/live_video_stream/status/' + mediaKey
    const res = await axios.get<any>(url, { headers })
    const data = res.data
    const dynamicUrl: string = data.source.location
    return dynamicUrl
  },

  async getStreamMasterUrl(mediaKey: string, headers?: Record<string, string>) {
    const dynamicUrl = await this.getStreamDynamicUrl(mediaKey, headers)
    const masterUrl = this.getStreamMasterUrlFromDynamicUrl(dynamicUrl)
    return masterUrl
  },

  async getStreamPlaylist(masterUrl: string) {
    const masterUrlWithoutExt = masterUrl.replace('master_playlist.m3u8', '')
    let res = await axios.get<string>(masterUrl)
    let data = res.data
    const playlistOrigin = new URL(masterUrl).origin
    const playlistSuffix = data.split('\n')[3]
    const playlistUrl = playlistOrigin + playlistSuffix
    res = await axios.get<string>(playlistUrl)
    data = res.data
    const playlistRawData = data
    const playlistFormatData = playlistRawData.replace(/^chunk/gm, masterUrlWithoutExt + 'chunk')
    return playlistFormatData
  },

  async downloadPlaylist(playlistUrl: string, fileName: string) {
    logger.info({ type: 'downloadPlaylist', playlistUrl })
    const playlistData = await this.getStreamPlaylist(playlistUrl)
    logger.info({ type: 'downloadPlaylist', msg: 'playlist downloaded' })
    const outPlaylistFilePath = path.join(__dirname, config.app.mediaDir, fileName + '.m3u8')
    const outAudioFilePath = path.join(__dirname, config.app.mediaDir, fileName + '.aac')
    logger.info({ type: 'downloadPlaylist', playlistPath: outPlaylistFilePath, audioPath: outAudioFilePath })
    this.makeMediaDir()
    fs.writeFileSync(outPlaylistFilePath, playlistData)
    logger.info({ type: 'downloadPlaylist', msg: 'playlist saved' })
    this.runFfmpeg(outPlaylistFilePath, outAudioFilePath)
  },

  runFfmpeg(playlistPath: string, audioPath: string) {
    const cmd = 'ffmpeg'
    const args = [
      '-protocol_whitelist',
      'file,https,tls,tcp',
      '-i',
      playlistPath,
      '-c',
      'copy',
      audioPath,
    ]

    if (process.platform === 'win32') {
      child_process.spawn('cmd', ['/c', [cmd, ...args].join(' ')], { detached: true })
    } else {
      child_process.spawn(cmd, args)
    }
  },
}
