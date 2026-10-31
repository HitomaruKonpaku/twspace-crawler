export class PeriscopeUtil {
  public static isFinalPlaylistUrl(url: string) {
    return /playlist_\d+\.m3u8/g.test(url)
      || /master_dynamic_\d+\.m3u8/g.test(url) // video space
  }

  public static getFinalPlaylistName(data: string) {
    return /playlist_\d+/g.exec(data)[0]
  }

  public static getMasterPlaylistUrl(url: string) {
    return url
      // Handle live playlist
      .replace('?type=live', '')
      .replace('dynamic_playlist', 'master_playlist')
      // Handle replay playlist
      .replace('?type=replay', '')
      .replace(/playlist_\d+/g, 'master_playlist')
      // Handle video space playlist
      .replace(/master_dynamic_\d+/g, 'master_master_playlist')
  }

  public static getPlaylistUrlCandidates(url: string): string[] {
    return [...new Set([
      ...this.getPathCandidates(url),
      ...this.getPathCandidates(this.getFallbackHostUrl(url)),
    ])]
  }

  private static getFallbackHostUrl(url: string) {
    return url.replace(
      /^(https?:\/\/)prod-fastly-[^/]+\.video\.pscp\.tv\//,
      '$1prod-fastly-p.video.pscp.tv/',
    )
  }

  private static getPathCandidates(url: string): string[] {
    const liveMatch = /\/x-media-live-stream-([^/]+)\//.exec(url)
    if (liveMatch) {
      const cluster = liveMatch[1]
      return [
        url,
        url.replace(liveMatch[0], '/periscope-replays-public/'),
        url.replace(liveMatch[0], `/periscope-replay-direct-prod-${cluster}-public/`),
      ]
    }

    const replayMatch = /\/periscope-replay-direct-prod-[^/]+\//.exec(url)
    if (replayMatch) {
      return [
        url,
        url.replace(replayMatch[0], '/periscope-replays-public/'),
      ]
    }

    return [url]
  }

  public static getChunks(data: string): number[] {
    const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_[a-z]\.)/gm
    return data.match(chunkIndexPattern)?.map((v) => Number(v)) || []
  }

  public static getChunkPrefix(playlistUrl: string) {
    const url = new URL(playlistUrl)
    const chunks = url.pathname.split('/')
    const audioSpaceIndex = chunks.findIndex((v) => v === 'audio-space')
    const filteredChunks = chunks.filter((v, i) => {
      if (i === audioSpaceIndex - 1) {
        // Check audio JWT & ignore if exist
        // with 86 is hls key length
        return v.length <= 86
      }
      return i <= audioSpaceIndex
    })
    const pathname = filteredChunks
      .join('/')
      .replace('/transcode/', '/non_transcode/')
    const prefix = `${url.origin + pathname}/`
    return prefix
  }
}
