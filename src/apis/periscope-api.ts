import axios from 'axios'
import { setTimeout as delay } from 'timers/promises'
import { AccessChat, ChatHistory } from '../interfaces/periscope.interface'
import { M3u8Util } from '../utils/m3u8.util'
import { PeriscopeUtil } from '../utils/periscope.util'

type PlaylistStage = 'master' | 'media'

class PlaylistUnavailableError extends Error {}

export class PlaylistCandidatesError extends Error {
  public readonly unavailable: boolean

  constructor(failures: Error[]) {
    const details = [...new Set(failures.map((error) => error.message))]
    super(`All playlist candidates exhausted (${failures.length}): ${details.join('; ')}`)
    this.unavailable = failures.every((error) => error instanceof PlaylistUnavailableError)
  }
}

export class PeriscopeApi {
  private static async tryCandidates<T>(urls: string[], fetch: (url: string) => Promise<T>): Promise<T> {
    const failures: Error[] = []
    for (const url of urls) {
      try {
        return await fetch(url)
      } catch (error) {
        failures.push(error)
      }
    }
    throw new PlaylistCandidatesError(failures)
  }

  private static async fetchPlaylist(url: string, stage: PlaylistStage) {
    const retryDelays = [250, 500]
    for (let attempt = 0; ; attempt++) {
      try {
        const { data } = await axios.get<string>(url)
        return data
      } catch (error) {
        const status = error.response?.status
        const unavailable = status === 404 || status === 410
        if (unavailable && attempt < retryDelays.length) {
          await delay(retryDelays[attempt])
          continue
        }
        // Axios errors retain request headers and URLs.
        if (unavailable) {
          throw new PlaylistUnavailableError(`${stage} playlist unavailable (HTTP ${status})`)
        }
        // eslint-disable-next-line preserve-caught-error
        throw new Error(`${stage} playlist request failed (${status ? `HTTP ${status}` : 'no HTTP response'})`)
      }
    }
  }

  public static async getMasterPlaylist(originUrl: string) {
    const masterUrl = PeriscopeUtil.getMasterPlaylistUrl(originUrl)
    return this.tryCandidates(PeriscopeUtil.getPlaylistUrlCandidates(masterUrl), (url) => this.fetchPlaylist(url, 'master'))
  }

  public static async resolveFinalPlaylist(originUrl: string) {
    const direct = PeriscopeUtil.isFinalPlaylistUrl(originUrl)
    const playlistUrl = direct ? originUrl : PeriscopeUtil.getMasterPlaylistUrl(originUrl)
    const candidates = PeriscopeUtil.getPlaylistUrlCandidates(playlistUrl)
    // Direct URLs may already be signed for a specific host and archive path.
    const urls = direct ? [...new Set([playlistUrl, ...candidates])] : candidates

    return this.tryCandidates(urls, async (url) => {
      let video = PeriscopeUtil.isVideoPlaylistUrl(originUrl)
      let audio = PeriscopeUtil.isAudioPlaylistUrl(new URL(originUrl))
      let stage: PlaylistStage = direct && !video ? 'media' : 'master'
      const visited = new Set<string>()
      while (!visited.has(url) && visited.size < 4) {
        visited.add(url)
        const data = await this.fetchPlaylist(url, stage)
        audio ||= PeriscopeUtil.isAudioPlaylistUrl(new URL(url))
        video = !audio && (video || PeriscopeUtil.isVideoPlaylistUrl(url))
        if (typeof data === 'string' && /^#EXTINF:/m.test(data)) {
          return { url, data, isVideo: video }
        }

        const { nextUrl, isVideo } = this.resolveVariant(data, url, stage, video, audio)
        video = isVideo
        if (!nextUrl) {
          return { url, data, isVideo: video }
        }
        url = nextUrl
        stage = 'media'
      }
      throw new Error('media playlist resolution failed (too many or repeated playlist references)')
    })
  }

  private static resolveVariant(data: string, url: string, stage: PlaylistStage, video: boolean, audio: boolean) {
    try {
      const manifest = M3u8Util.parse(data)
      const variants = manifest.playlists ?? []
      // Audio Space masters can advertise X's video transcodes alongside their AAC replay.
      const isVideo = !audio && (video || (
        variants.length > 0
        && variants.every(({ attributes }) => attributes.RESOLUTION
          || /(?:^|,\s*)(?:avc[13]|hvc1|hev1|vp0?[89]|av01)(?:\.|,|$)/i.test(attributes.CODECS ?? ''))
        && !variants.every(({ uri }) => PeriscopeUtil.isAudioPlaylistUrl(new URL(uri, url)))
      ))
      let uri: string
      if (isVideo && variants.length) {
        const variant = [...variants].sort((a, b) =>
          (b.attributes.RESOLUTION?.height ?? 0) - (a.attributes.RESOLUTION?.height ?? 0)
          || (b.attributes.RESOLUTION?.width ?? 0) - (a.attributes.RESOLUTION?.width ?? 0))[0]
        const audioGroup = manifest.mediaGroups?.AUDIO?.[variant.attributes.AUDIO]
        if (Object.values(audioGroup ?? {}).some((item) => item.uri)) {
          // FFmpeg needs the master to download and mux separate audio and video.
          return { nextUrl: undefined, isVideo }
        }
        uri = variant.uri
      } else {
        uri = PeriscopeUtil.getAudioPlaylistUri(manifest)
      }
      if (uri) {
        const resolved = new URL(uri, url)
        if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
          return { nextUrl: resolved.href, isVideo }
        }
      }
    } catch {
      // Parser and URL errors can contain the original response and signed URIs.
    }
    throw new Error(`${stage} playlist has no usable ${video ? 'media' : 'audio'} URI`)
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
