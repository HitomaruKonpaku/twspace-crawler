export class PeriscopeUtil {
  public static isFinalPlaylistUrl(url: string) {
    return /playlist_\d+\.m3u8/g.test(url)
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
  }

  public static getChunks(data: string): number[] {
    const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_a\.)/gm
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
