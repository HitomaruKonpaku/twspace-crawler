import { Manifest } from 'm3u8-parser'

export class PeriscopeUtil {
  public static isFinalPlaylistUrl(url: string) {
    return /\/(?:playlist|master_dynamic)_\d+\.m3u8$/.test(new URL(url).pathname)
  }

  public static isVideoPlaylistUrl(url: string) {
    return /\/video-space\/|\/(?:master_dynamic_\d+|master_master_playlist)\.m3u8$/.test(new URL(url).pathname)
  }

  public static isAudioPlaylistUrl(url: URL) {
    return url.pathname.split('/').includes('audio-space')
  }

  public static getPlaylistLogDetails(url?: string) {
    if (!url) {
      return undefined
    }
    try {
      const { hostname, pathname } = new URL(url)
      const playlist = /\/((?:dynamic_playlist|master_playlist|master_master_playlist|playlist_\d+|master_dynamic_\d+)\.m3u8)$/.exec(pathname)?.[1]
      return { host: hostname, playlist }
    } catch {
      return { invalidUrl: true }
    }
  }

  public static getAudioPlaylistUri(manifest: Manifest) {
    const playlists = manifest.playlists ?? []
    const audioGroups = manifest.mediaGroups?.AUDIO ?? {}
    const groupIds = playlists.map((item) => item.attributes.AUDIO).filter(Boolean)
    const renditions = (groupIds.length ? groupIds : Object.keys(audioGroups))
      .flatMap((id) => Object.values(audioGroups[id] ?? {}))
      .filter((item) => item.uri)
    const rendition = renditions.find((item) => item.default) ?? renditions[0]
    if (rendition) {
      return rendition.uri
    }

    return playlists.find(({ attributes }) => {
      const codecs = attributes.CODECS?.split(',').map((codec) => codec.trim())
      return !codecs || codecs.some((codec) => /^(mp4a|aac|ac-3|ec-3|ac-4|opus|flac|mp3|alac)(\.|$)/i.test(codec))
    })?.uri
  }

  public static getMasterPlaylistUrl(url: string) {
    const master = new URL(url)
    const pathname = master.pathname
      .replace(/\/(dynamic_playlist|playlist_\d+)\.m3u8$/, '/master_playlist.m3u8')
      .replace(/\/master_dynamic_\d+\.m3u8$/, '/master_master_playlist.m3u8')
    if (pathname !== master.pathname) {
      master.pathname = pathname
      master.search = master.search.slice(1).split('&')
        .filter((param) => param !== 'type=live' && param !== 'type=replay')
        .join('&')
    }
    return master.href
  }

  public static getPlaylistUrlCandidates(url: string): string[] {
    // ponytail: prefer the fallback region host (prod-fastly-p), its replay
    // paths returned 200 when the original region host returned 400/403.
    return [...new Set([
      ...this.getPathCandidates(this.getFallbackHostUrl(url)),
      ...this.getPathCandidates(url),
    ])]
  }

  private static getFallbackHostUrl(url: string) {
    return url.replace(
      /^(https?:\/\/)prod-fastly-[^/]+\.video\.pscp\.tv\//,
      '$1prod-fastly-p.video.pscp.tv/',
    )
  }

  private static getPathCandidates(url: string): string[] {
    const candidate = new URL(url)
    const pathname = candidate.pathname
    const withArchivePath = (pattern: string, replacement: string) => {
      candidate.pathname = pathname.replace(pattern, replacement)
      return candidate.href
    }
    const liveMatch = /\/x-media-live-stream-([^/]+)\//.exec(pathname)
    if (liveMatch) {
      const cluster = liveMatch[1]
      return [
        url,
        withArchivePath(liveMatch[0], '/periscope-replays-public/'),
        withArchivePath(liveMatch[0], `/periscope-replay-direct-prod-${cluster}-public/`),
      ]
    }

    const replayMatch = /\/periscope-replay-direct-prod-[^/]+\//.exec(pathname)
    if (replayMatch) {
      return [
        url,
        withArchivePath(replayMatch[0], '/periscope-replays-public/'),
      ]
    }

    return [url]
  }

  public static getChunks(data: string): number[] {
    const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_[a-z]\.)/gm
    return data.match(chunkIndexPattern)?.map((v) => Number(v)) || []
  }

  public static getChunkPrefix(playlistUrl: string) {
    return new URL('.', playlistUrl).href
  }

  public static getChunkUrlCandidates(playlistUrl: string, uri: string) {
    const url = new URL(playlistUrl)
    const chunkUrl = new URL(uri, this.getChunkPrefix(playlistUrl)).href
    // Periscope also serves bare audio chunk names from its non-transcoded backing path.
    if (!/^chunk_[\w.]+(?:\?|$)/.test(uri)) {
      return [chunkUrl]
    }
    const chunks = url.pathname.split('/')
    const audioSpaceIndex = chunks.indexOf('audio-space')
    if (audioSpaceIndex < 0) {
      return [chunkUrl]
    }

    const archivePath = chunks.slice(0, audioSpaceIndex + 1)
    if (archivePath[audioSpaceIndex - 1].length > 86) {
      archivePath.splice(audioSpaceIndex - 1, 1)
    }
    url.pathname = archivePath.join('/').replace('/transcode/', '/non_transcode/') + '/'
    const archiveUrl = new URL(uri, url).href
    const unprefixedUrl = url.pathname.startsWith('/b/Transcoding/')
      ? new URL(uri, new URL(url.pathname.slice(2), url)).href
      : archiveUrl
    return [...new Set([chunkUrl, archiveUrl, unprefixedUrl])]
  }
}
