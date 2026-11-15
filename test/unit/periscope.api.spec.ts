import axios from 'axios'
import { setTimeout as delay } from 'timers/promises'
import { PeriscopeApi } from '../../src/apis/periscope-api'

jest.mock('timers/promises', () => ({ setTimeout: jest.fn(async () => {}) }))

const base = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const liveUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const liveFinalUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/playlist_1.m3u8`
const genericUrl = `${base}/periscope-replays-public/audio-space/master_playlist.m3u8`
const genericFinalUrl = `${base}/periscope-replays-public/audio-space/playlist_1.m3u8`
const regionalUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const regionalFinalUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_1.m3u8`
const fallbackBase = 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const fallbackRegionalUrl = `${fallbackBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const fallbackRegionalFinalUrl = `${fallbackBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_1.m3u8`

const masterData = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=128000\nplaylist_1.m3u8\n'
const finalData = '#EXTM3U\n#EXTINF:10,\nchunk_1_1_b.aac\n'

const originalGet = axios.get

const httpError = (status: number) => Object.assign(
  new Error('Private values: Cookie=SECRET_COOKIE, Authorization=SECRET_AUTH, https://example.test/SECRET_TOKEN?sig=SECRET_SIG'),
  { response: { status } },
)
const notFound = () => httpError(404)

const mockGet = (handler: (url: string) => Promise<any>) => {
  (axios as any).get = handler
}

afterEach(() => {
  (axios as any).get = originalGet
  jest.clearAllMocks()
})

describe('PeriscopeApi', () => {
  describe('resolveFinalPlaylist', () => {
    it.each([
      ['nested relative', '../nested/audio/stream.m3u8?sig=a%2Fb&x=2', 'https://example.test/top/nested/audio/stream.m3u8?sig=a%2Fb&x=2'],
      ['root-relative', '/other/nested/stream.m3u8?sig=abc', 'https://example.test/other/nested/stream.m3u8?sig=abc'],
      ['absolute', 'https://cdn.example.test/audio/stream.m3u8?sig=abc', 'https://cdn.example.test/audio/stream.m3u8?sig=abc'],
    ])('preserves the %s URI and its query', async (_, uri, expectedUrl) => {
      const masterUrl = 'https://example.test/top/private/master.m3u8?sig=master'
      const get = jest.fn(async (url: string) => {
        if (url === masterUrl) {
          return { data: masterData.replace('playlist_1.m3u8', uri) }
        }
        if (url === expectedUrl) {
          return { data: finalData }
        }
        throw notFound()
      })
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(masterUrl)).resolves.toMatchObject({ url: expectedUrl, data: finalData })
      expect(get.mock.calls).toEqual([[masterUrl], [expectedUrl]])
    })

    it('selects the default referenced audio rendition over video-only variants', async () => {
      const masterUrl = 'https://example.test/live/master.m3u8'
      const audioUrl = 'https://example.test/audio/default.m3u8?sig=abc'
      const data = [
        '#EXTM3U',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Secondary",URI="secondary.m3u8"',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Default",DEFAULT=YES,URI="/audio/default.m3u8?sig=abc"',
        '#EXT-X-STREAM-INF:BANDWIDTH=1000000,CODECS="mp4a.40.2",AUDIO="audio"',
        'video.m3u8',
      ].join('\n')
      const get = jest.fn(async (url: string) => ({ data: url === masterUrl ? data : finalData }))
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(masterUrl)).resolves.toMatchObject({ url: audioUrl, data: finalData })
      expect(get.mock.calls).toEqual([[masterUrl], [audioUrl]])
    })

    it('handles an EXT-X-MEDIA audio rendition without stream variants', async () => {
      const url = 'https://example.test/master.m3u8'
      mockGet(async (requestUrl) => ({
        data: requestUrl === url
          ? '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="group",NAME="Audio",URI="fallback.m3u8"\n'
          : finalData,
      }))

      await expect(PeriscopeApi.resolveFinalPlaylist(url))
        .resolves.toMatchObject({ url: 'https://example.test/fallback.m3u8', data: finalData })
    })

    it('skips a video-only stream and keeps the first audio-capable stream', async () => {
      const masterUrl = 'https://example.test/master.m3u8'
      const mediaUrl = 'https://example.test/audio.m3u8'
      mockGet(async (url) => ({
        data: url === masterUrl ? [
          '#EXTM3U',
          '#EXT-X-STREAM-INF:BANDWIDTH=1000000,CODECS="avc1.640015"',
          'video.m3u8',
          '#EXT-X-STREAM-INF:BANDWIDTH=64000,CODECS="mp4a.40.2"',
          'audio.m3u8',
          '#EXT-X-STREAM-INF:BANDWIDTH=128000',
          'other.m3u8',
        ].join('\n') : finalData,
      }))

      await expect(PeriscopeApi.resolveFinalPlaylist(masterUrl)).resolves.toMatchObject({ url: mediaUrl, data: finalData })
    })

    it.each([`${liveFinalUrl}?sig=a%2Fb`, 'https://example.test/media.m3u8?type=replay&sig=abc'])(
      'accepts an already-final media playlist without an extra request (%s)',
      async (url) => {
        const get = jest.fn(async () => ({ data: finalData }))
        mockGet(get)
        await expect(PeriscopeApi.resolveFinalPlaylist(url)).resolves.toMatchObject({ url, data: finalData })
        expect(get.mock.calls).toEqual([[url]])
      },
    )

    it('keeps the highest-resolution muxed variant for a direct video Space URL', async () => {
      const url = 'https://example.test/video-space/master_dynamic_123.m3u8?sig=abc'
      const mediaUrl = 'https://example.test/video-space/high/index.m3u8?sig=high'
      const data = [
        '#EXTM3U',
        '#EXT-X-STREAM-INF:BANDWIDTH=100000,RESOLUTION=320x240,CODECS="avc1.640015,mp4a.40.2"',
        'low.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x480,CODECS="avc1.640015,mp4a.40.2"',
        'high/index.m3u8?sig=high',
      ].join('\n')
      const get = jest.fn(async (requestUrl: string) => ({ data: requestUrl === url ? data : finalData }))
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(url)).resolves.toMatchObject({ url: mediaUrl, data: finalData })
      expect(get.mock.calls).toEqual([[url], [mediaUrl]])
    })

    it('recognizes video codecs in a generic master without resolution attributes', async () => {
      const url = 'https://example.test/master.m3u8'
      const mediaUrl = 'https://example.test/video.m3u8'
      const master = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=100000,CODECS="avc1.640015,mp4a.40.2"\nvideo.m3u8\n'
      mockGet(async (requestUrl) => ({ data: requestUrl === url ? master : finalData }))

      await expect(PeriscopeApi.resolveFinalPlaylist(url))
        .resolves.toMatchObject({ url: mediaUrl, isVideo: true })
    })

    it('preserves a video master with separate audio for FFmpeg', async () => {
      const url = 'https://example.test/video-space/master_master_playlist.m3u8'
      const data = [
        '#EXTM3U',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="Default",DEFAULT=YES,URI="audio.m3u8"',
        '#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x480,CODECS="avc1.640015",AUDIO="audio"',
        'video.m3u8',
      ].join('\n')
      const get = jest.fn(async () => ({ data }))
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(url)).resolves.toMatchObject({ url, data })
      expect(get).toHaveBeenCalledTimes(1)
    })

    it('fetches the root-relative /b/ URI from the successful master', async () => {
      const uri = '/b/Transcoding/v1/hls/TOKEN/transcode/region/archive/JWT/audio-space/playlist_1.m3u8?sig=abc'
      const expectedUrl = new URL(uri, fallbackRegionalUrl).href
      mockGet(async (url) => {
        if (url === fallbackRegionalUrl) {
          return { data: masterData.replace('playlist_1.m3u8', uri) }
        }
        if (url === expectedUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      await expect(PeriscopeApi.resolveFinalPlaylist(fallbackRegionalUrl))
        .resolves.toMatchObject({ url: expectedUrl, data: finalData })
    })

    it('uses the generic archive when the live master playlist returns 404', async () => {
      mockGet(async (url: string) => {
        if (url === genericUrl) {
          return { data: masterData }
        }
        if (url === genericFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      const result = await PeriscopeApi.resolveFinalPlaylist(liveUrl)
      expect(result.url).toEqual(genericFinalUrl)
      expect(result.data).toEqual(finalData)
    })

    it('uses the generic archive when the live final playlist returns 404', async () => {
      mockGet(async (url: string) => {
        if (url === liveUrl) {
          return { data: masterData }
        }
        if (url === liveFinalUrl) {
          throw notFound()
        }
        if (url === genericUrl) {
          return { data: masterData }
        }
        if (url === genericFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      const result = await PeriscopeApi.resolveFinalPlaylist(liveUrl)
      expect(result.url).toEqual(genericFinalUrl)
      expect(result.data).toEqual(finalData)
    })

    it('uses the regional archive when the generic archive fails', async () => {
      mockGet(async (url: string) => {
        if (url === regionalUrl) {
          return { data: masterData }
        }
        if (url === regionalFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      const result = await PeriscopeApi.resolveFinalPlaylist(liveUrl)
      expect(result.url).toEqual(regionalFinalUrl)
      expect(result.data).toEqual(finalData)
    })

    it('uses the prod-fastly-p host when the original host fails', async () => {
      mockGet(async (url: string) => {
        if (url === fallbackRegionalUrl) {
          return { data: masterData }
        }
        if (url === fallbackRegionalFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      const result = await PeriscopeApi.resolveFinalPlaylist(liveUrl)
      expect(result.url).toEqual(fallbackRegionalFinalUrl)
      expect(result.data).toEqual(finalData)
    })

    it.each([404, 410])('backs off twice for HTTP %s and succeeds on the third attempt', async (status) => {
      const url = 'https://example.test/playlist_1.m3u8?sig=abc'
      const get = jest.fn()
        .mockRejectedValueOnce(httpError(status))
        .mockRejectedValueOnce(httpError(status))
        .mockResolvedValueOnce({ data: finalData })
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(url)).resolves.toMatchObject({ url, data: finalData })
      expect(get.mock.calls).toEqual([[url], [url], [url]])
      expect(jest.mocked(delay).mock.calls).toEqual([[250], [500]])
    })

    it('reports exhausted candidates with both failure stages and no sensitive request details', async () => {
      const masterUrl = fallbackRegionalUrl
      const mediaUrl = new URL('playlist_1.m3u8', masterUrl).href
      const fallbackUrl = masterUrl.replace('periscope-replay-direct-prod-ap-northeast-1-public', 'periscope-replays-public')
      const get = jest.fn(async (url: string) => {
        if (url === masterUrl) {
          return { data: masterData }
        }
        throw httpError(url === mediaUrl ? 410 : 404)
      })
      mockGet(get)

      await expect(PeriscopeApi.resolveFinalPlaylist(masterUrl)).rejects.toThrow(
        /^All playlist candidates exhausted \(2\): media playlist unavailable \(HTTP 410\); master playlist unavailable \(HTTP 404\)$/,
      )
      expect(get.mock.calls.flat()).toEqual([
        masterUrl, mediaUrl, mediaUrl, mediaUrl, fallbackUrl, fallbackUrl, fallbackUrl,
      ])
      expect(jest.mocked(delay).mock.calls).toEqual([[250], [500], [250], [500]])
    })

    it.each([429, 503])('preserves candidate fallback without per-request retries on HTTP %s', async (status) => {
      const get = jest.fn().mockRejectedValue(httpError(status))
      mockGet(get)
      await expect(PeriscopeApi.getMasterPlaylist(fallbackRegionalUrl)).rejects.toThrow(
        `All playlist candidates exhausted (2): master playlist request failed (HTTP ${status})`,
      )
      expect(get).toHaveBeenCalledTimes(2)
      expect(delay).not.toHaveBeenCalled()
    })
  })

  describe('getFinalPlaylistUrl', () => {
    it('returns the generic archive final playlist URL', async () => {
      mockGet(async (url: string) => {
        if (url === genericUrl) {
          return { data: masterData }
        }
        if (url === genericFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      expect(await PeriscopeApi.getFinalPlaylistUrl(liveUrl)).toEqual(genericFinalUrl)
    })
  })

  describe('getFinalPlaylist', () => {
    it('returns the generic archive final playlist data', async () => {
      mockGet(async (url: string) => {
        if (url === genericUrl) {
          return { data: masterData }
        }
        if (url === genericFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      expect(await PeriscopeApi.getFinalPlaylist(liveUrl)).toEqual(finalData)
    })
  })

  describe('getMasterPlaylist', () => {
    it('returns the generic archive master playlist data', async () => {
      mockGet(async (url: string) => {
        if (url === genericUrl) {
          return { data: masterData }
        }
        throw notFound()
      })

      expect(await PeriscopeApi.getMasterPlaylist(liveUrl)).toEqual(masterData)
    })
  })
})
