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
    const data = await this.getMasterPlaylist(originUrl)
    const url = PeriscopeUtil.getMasterPlaylistUrl(originUrl)
      .replace('master_playlist', PeriscopeUtil.getFinalPlaylistName(data))
    return url
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
