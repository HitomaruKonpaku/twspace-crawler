import axios from 'axios'
import { AccessChat, ChatHistory } from '../interfaces/Periscope.interface'
import { PeriscopeUtil } from '../utils/PeriscopeUtil'

export class PeriscopeApi {
  public static async getMasterPlaylist(originUrl: string) {
    const url = PeriscopeUtil.getMasterPlaylistUrl(originUrl)
    const { data } = await axios.get<string>(url)
    return data
  }

  public static async getFinalPlaylistUrl(originUrl: string) {
    if (PeriscopeUtil.isFinalPlaylistUrl(originUrl)) {
      return originUrl
    }

    // Handle master_master_playlist case (video spaces)
    // First convert to master_playlist URL
    let masterUrl = PeriscopeUtil.getMasterPlaylistUrl(originUrl)

    // If the original URL contained master_master_playlist, we need to fetch it
    // and extract a reference to an actual master_playlist
    if (originUrl.includes('master_master_playlist')) {
      const masterMasterData = await this.getMasterPlaylist(originUrl)
      // Parse the master_master_playlist to find audio stream or lowest quality stream
      const streamUrl = this.extractStreamUrl(masterMasterData, masterUrl)
      if (streamUrl) {
        masterUrl = streamUrl
      }
    }

    const data = await this.getMasterPlaylist(masterUrl)
    const url = masterUrl
      .replace('master_playlist', PeriscopeUtil.getFinalPlaylistName(data))
    return url
  }

  private static extractStreamUrl(playlistContent: string, baseUrl: string): string | null {
    // Parse m3u8 playlist to find the best audio stream
    const lines = playlistContent.split('\n')
    let bestStreamUrl: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for audio-only stream first (CODECS contains only audio codec)
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const codecsMatch = line.match(/CODECS="([^"]+)"/)
        const nextLine = lines[i + 1]?.trim()

        if (codecsMatch && nextLine) {
          const codecs = codecsMatch[1]
          // Check if it's audio-only (only has audio codec like mp4a)
          if (codecs.includes('mp4a') && !codecs.includes('avc') && !codecs.includes('hvc')) {
            bestStreamUrl = nextLine.startsWith('http') ? nextLine : new URL(nextLine, baseUrl).href
            break // Prefer audio-only stream
          }
          // Otherwise, store as fallback (will use lowest quality video with audio)
          if (!bestStreamUrl && nextLine) {
            bestStreamUrl = nextLine.startsWith('http') ? nextLine : new URL(nextLine, baseUrl).href
          }
        }
      }
    }

    return bestStreamUrl
  }

  public static async getFinalPlaylist(originUrl: string) {
    const { data } = await axios.get<string>(await this.getFinalPlaylistUrl(originUrl))
    return data
  }

  public static async getAccessChat(chatToken: string) {
    const { data } = await axios.post<AccessChat>(
      'https://proxsee.pscp.tv/api/v2/accessChatPublic',
      { chat_token: chatToken },
    )
    return data
  }

  public static async getChatHistory(endpoint: string, roomId: string, accessToken: string, cursor?: string) {
    const url = new URL('chatapi/v1/history', endpoint).href
    const { data } = await axios.post<ChatHistory>(
      url,
      { room: roomId, access_token: accessToken, cursor },
    )
    return data
  }
}
