export class PeriscopeUtil {
  public static isFinalPlaylistUrl(url: string) {
    return /playlist_\d+\.m3u8/g.test(url)
  }

  public static getMasterPlaylistUrl(url: string) {
    return url
      .replace('?type=live', '')
      .replace('dynamic', 'master')
  }

  public static getChunks(data: string): number[] {
    const chunkIndexPattern = /(?<=chunk_\d+_)\d+(?=_a\.)/gm
    return data.match(chunkIndexPattern)?.map((v) => Number(v)) || []
  }

  public static getChunkPrefix(playlistUrl: string) {
    const url = new URL(playlistUrl)
    const { origin } = url
    const pathname = url.pathname
      .split('/')
      .filter((_, i) => ![8, 10].includes(i))
      .join('/')
      .replace('/transcode/', '/non_transcode/')
    return `${origin + pathname}/`
  }
}
