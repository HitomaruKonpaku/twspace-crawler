import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { PeriscopeApi } from '../../src/apis/periscope-api'

const lab = Lab.script()
const { describe, it, afterEach } = lab
export { lab }

const base = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const liveUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const liveFinalUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/playlist_1.m3u8`
const genericUrl = `${base}/periscope-replays-public/audio-space/master_playlist.m3u8`
const genericFinalUrl = `${base}/periscope-replays-public/audio-space/playlist_1.m3u8`
const regionalUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const regionalFinalUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_1.m3u8`
const pBase = 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const pRegionalUrl = `${pBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const pRegionalFinalUrl = `${pBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_1.m3u8`

const masterData = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=128000\nplaylist_1.m3u8\n'
const finalData = '#EXTM3U\n#EXTINF:10,\nchunk_1_1_b.aac\n'

const originalGet = axios.get

const notFound = () => {
  const error: any = new Error('Request failed with status code 404')
  error.response = { status: 404 }
  return error
}

const mockGet = (handler: (url: string) => Promise<any>) => {
  (axios as any).get = handler
}

afterEach(() => {
  (axios as any).get = originalGet
})

describe('PeriscopeApi', () => {
  describe('resolveFinalPlaylist', () => {
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
      expect(result.url).equal(genericFinalUrl)
      expect(result.data).equal(finalData)
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
      expect(result.url).equal(genericFinalUrl)
      expect(result.data).equal(finalData)
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
      expect(result.url).equal(regionalFinalUrl)
      expect(result.data).equal(finalData)
    })

    it('uses the prod-fastly-p host when the original host fails', async () => {
      mockGet(async (url: string) => {
        if (url === pRegionalUrl) {
          return { data: masterData }
        }
        if (url === pRegionalFinalUrl) {
          return { data: finalData }
        }
        throw notFound()
      })

      const result = await PeriscopeApi.resolveFinalPlaylist(liveUrl)
      expect(result.url).equal(pRegionalFinalUrl)
      expect(result.data).equal(finalData)
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

      expect(await PeriscopeApi.getFinalPlaylistUrl(liveUrl)).equal(genericFinalUrl)
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

      expect(await PeriscopeApi.getFinalPlaylist(liveUrl)).equal(finalData)
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

      expect(await PeriscopeApi.getMasterPlaylist(liveUrl)).equal(masterData)
    })
  })
})
