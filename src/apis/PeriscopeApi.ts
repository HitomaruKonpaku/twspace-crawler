import axios from 'axios'
import { AccessChat, ChatHistory } from '../interfaces/Periscope.interface'

export class PeriscopeApi {
  public static async getAccessChat(chatToken: string) {
    const { data } = await axios.post<AccessChat>(
      'https://proxsee.pscp.tv/api/v2/accessChatPublic',
      { chat_token: chatToken },
    )
    return data
  }

  // eslint-disable-next-line max-len
  public static async getChatHistory(endpoint: string, roomId: string, accessToken: string, cursor?: string) {
    const url = new URL('chatapi/v1/history', endpoint).href
    const { data } = await axios.post<ChatHistory>(
      url,
      { room: roomId, access_token: accessToken, cursor },
    )
    return data
  }
}
