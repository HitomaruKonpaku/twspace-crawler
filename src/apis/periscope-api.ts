import axios from 'axios'
import { AccessChat, ChatHistory } from '../interfaces/periscope.interface'
import { PeriscopeUtil } from '../utils/periscope-util'

export class PeriscopeApi {
  private static async tryCandidates<T>(
    urls: string[],
    fn: (url: string) => Promise<T>,
  ): Promise<{ url: string, result: T }> {
    let lastError: Error
    // eslint-disable-next-line no-restricted-syntax
    for (const url of urls) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return { url, result: await fn(url) }
      } catch (error) {
        lastError = error
      }
    }
    throw lastError
  }

  public static async getMasterPlaylist(originUrl: string) {
    const masterUrl = PeriscopeUtil.getMasterPlaylistUrl(originUrl)
    const { result } = await this.tryCandidates(
      PeriscopeUtil.getPlaylistUrlCandidates(masterUrl),
      async (url) => {
        const { data } = await axios.get<string>(url)
        return data
      },
    )
    return result
  }

  public static async resolveFinalPlaylist(originUrl: string) {
    if (PeriscopeUtil.isFinalPlaylistUrl(originUrl)) {
      const { data } = await axios.get<string>(originUrl)
      return { url: originUrl, data }
    }

    const masterUrl = PeriscopeUtil.getMasterPlaylistUrl(originUrl)
    const { result } = await this.tryCandidates(
      PeriscopeUtil.getPlaylistUrlCandidates(masterUrl),
      async (url) => {
        const { data: masterData } = await axios.get<string>(url)
        const finalUrl = url.replace('master_playlist', PeriscopeUtil.getFinalPlaylistName(masterData))
        const { data } = await axios.get<string>(finalUrl)
        return { url: finalUrl, data }
      },
    )
    return result
  }

  public static async getFinalPlaylistUrl(originUrl: string) {
    if (PeriscopeUtil.isFinalPlaylistUrl(originUrl)) {
      return originUrl
    }
    const { url } = await this.resolveFinalPlaylist(originUrl)
    return url
  }

  public static async getFinalPlaylist(originUrl: string) {
    const { data } = await this.resolveFinalPlaylist(originUrl)
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
